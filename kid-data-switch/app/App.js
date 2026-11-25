import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

const KEY_URL = 'kds_server_url';
const KEY_TOKEN = 'kds_token';
// Driving two websites takes a while; give up after three minutes.
const CHANGE_TIMEOUT_MS = 180000;

async function call(serverUrl, token, method, path, body, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(serverUrl.replace(/\/+$/, '') + path, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const json = await res.json();
    if (!json.providers) throw new Error(json.error || `Server replied ${res.status}`);
    return json;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The server took too long to answer');
    if (err.message === 'Network request failed') throw new Error('Cannot reach the server');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function describe(p) {
  if (p.data === 'off') return 'Data is OFF';
  if (p.data === 'on') return 'Data is ON';
  return 'Not set yet';
}

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [serverUrl, setServerUrl] = useState('');
  const [token, setToken] = useState('');
  const [editing, setEditing] = useState(false);
  const [providers, setProviders] = useState(null);
  const [working, setWorking] = useState(null); // 'on' | 'off' | null
  const [error, setError] = useState(null);

  const refresh = useCallback(async (url, tok) => {
    try {
      const json = await call(url, tok, 'GET', '/status');
      setProviders(json.providers);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const url = (await SecureStore.getItemAsync(KEY_URL)) || '';
      const tok = (await SecureStore.getItemAsync(KEY_TOKEN)) || '';
      setServerUrl(url);
      setToken(tok);
      setEditing(!url || !tok);
      setLoaded(true);
      if (url && tok) refresh(url, tok);
    })();
  }, [refresh]);

  const save = async () => {
    const url = serverUrl.trim();
    const tok = token.trim();
    if (!/^https?:\/\//.test(url)) return setError('Server address must start with http:// or https://');
    if (!tok) return setError('Enter the access code');
    await SecureStore.setItemAsync(KEY_URL, url);
    await SecureStore.setItemAsync(KEY_TOKEN, tok);
    setServerUrl(url);
    setToken(tok);
    setEditing(false);
    setError(null);
    refresh(url, tok);
  };

  const change = async (on) => {
    setWorking(on ? 'on' : 'off');
    setError(null);
    try {
      const json = await call(serverUrl, token, 'POST', '/data', { on }, CHANGE_TIMEOUT_MS);
      setProviders(json.providers);
      if (!json.ok) setError('Not everything changed. See below.');
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  };

  if (!loaded) {
    return (
      <View style={[styles.screen, styles.center]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Kid Data Switch</Text>

        {editing ? (
          <View>
            <Text style={styles.label}>Server address</Text>
            <TextInput
              style={styles.input}
              value={serverUrl}
              onChangeText={setServerUrl}
              placeholder="http://192.168.1.50:8787"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Text style={styles.label}>Access code</Text>
            <TextInput
              style={styles.input}
              value={token}
              onChangeText={setToken}
              placeholder="KDS_TOKEN from the server"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            <Pressable style={[styles.button, styles.neutral]} onPress={save}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
          </View>
        ) : (
          <View>
            <Pressable
              style={[styles.button, styles.off, working && styles.disabled]}
              disabled={!!working}
              onPress={() => change(false)}
            >
              <Text style={styles.buttonText}>
                {working === 'off' ? 'Turning data off…' : 'Turn data OFF'}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.on, working && styles.disabled]}
              disabled={!!working}
              onPress={() => change(true)}
            >
              <Text style={styles.buttonText}>
                {working === 'on' ? 'Turning data on…' : 'Turn data ON'}
              </Text>
            </Pressable>
            {working && (
              <View style={styles.row}>
                <ActivityIndicator />
                <Text style={styles.hint}>  This can take up to a minute.</Text>
              </View>
            )}

            {(providers || []).map((p) => (
              <View key={p.id} style={styles.card}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.cardState}>{describe(p)}</Text>
                {p.changedAt && (
                  <Text style={styles.hint}>Last changed {new Date(p.changedAt).toLocaleString()}</Text>
                )}
                {p.error && <Text style={styles.errorText}>Last attempt failed: {p.error}</Text>}
              </View>
            ))}

            <View style={styles.row}>
              <Pressable onPress={() => refresh(serverUrl, token)} disabled={!!working}>
                <Text style={styles.link}>Refresh</Text>
              </Pressable>
              <Text style={styles.hint}>   ·   </Text>
              <Pressable onPress={() => setEditing(true)} disabled={!!working}>
                <Text style={styles.link}>Settings</Text>
              </Pressable>
            </View>
          </View>
        )}

        {error && <Text style={[styles.errorText, styles.errorBox]}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f6f7f9' },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, color: '#111' },
  label: { fontSize: 14, color: '#444', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ccd0d6',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  button: { borderRadius: 14, paddingVertical: 22, alignItems: 'center', marginTop: 14 },
  buttonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  off: { backgroundColor: '#c0392b' },
  on: { backgroundColor: '#1e8449' },
  neutral: { backgroundColor: '#2c3e50' },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 16 },
  cardTitle: { fontSize: 14, color: '#555' },
  cardState: { fontSize: 20, fontWeight: '600', marginTop: 4, color: '#111' },
  hint: { fontSize: 13, color: '#666', marginTop: 4 },
  link: { fontSize: 16, color: '#1f5fbf' },
  errorText: { color: '#b03a2e', fontSize: 14, marginTop: 6 },
  errorBox: { marginTop: 18, textAlign: 'center' },
});
