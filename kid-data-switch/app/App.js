import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";

const KEY_URL = "kds_server_url";
const KEY_TOKEN = "kds_token";
// Driving two websites takes a while; give up after three minutes.
const CHANGE_TIMEOUT_MS = 180000;

// SecureStore has no web version; the browser preview falls back to localStorage.
const storage =
  Platform.OS === "web"
    ? {
        get: async (k) => globalThis.localStorage.getItem(k),
        set: async (k, v) => globalThis.localStorage.setItem(k, v),
      }
    : { get: SecureStore.getItemAsync, set: SecureStore.setItemAsync };

const THEMES = {
  light: {
    bg: "#f4f5f7",
    surface: "#ffffff",
    text: "#14171c",
    muted: "#6b7280",
    line: "#e5e7eb",
    on: "#15803d",
    onSoft: "#dcfce7",
    off: "#475569",
    offSoft: "#e2e8f0",
    mixed: "#b45309",
    mixedSoft: "#fef3c7",
    danger: "#b91c1c",
    dangerSoft: "#fee2e2",
    primary: "#14171c",
    primaryText: "#ffffff",
  },
  dark: {
    bg: "#0e1013",
    surface: "#191c21",
    text: "#f3f4f6",
    muted: "#9ca3af",
    line: "#2a2e35",
    on: "#4ade80",
    onSoft: "#12301f",
    off: "#94a3b8",
    offSoft: "#232831",
    mixed: "#fbbf24",
    mixedSoft: "#3a2c0c",
    danger: "#f87171",
    dangerSoft: "#3b1717",
    primary: "#f3f4f6",
    primaryText: "#14171c",
  },
};

async function call(serverUrl, token, method, path, body, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(serverUrl.replace(/\/+$/, "") + path, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
    const json = await res.json();
    if (!json.providers)
      throw new Error(json.error || `Server replied ${res.status}`);
    return json;
  } catch (err) {
    if (err.name === "AbortError")
      throw new Error("The server took too long to answer.");
    if (/Network request failed|Failed to fetch/.test(err.message)) {
      throw new Error(
        "Can’t reach the server. Check that it is running and you are on home WiFi.",
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// One overall state from the per-service states.
function overall(providers) {
  if (!providers || !providers.length) return "unknown";
  const states = new Set(providers.map((p) => p.data));
  if (states.size === 1) return [...states][0]; // 'on' | 'off' | 'unknown'
  return "mixed";
}

function when(iso) {
  const d = new Date(iso);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const today = new Date().toDateString() === d.toDateString();
  return today
    ? `today at ${time}`
    : `${d.toLocaleDateString([], { month: "short", day: "numeric" })} at ${time}`;
}

const HERO = {
  on: {
    badge: "ON",
    title: "Data is on",
    sub: "Cellular and home WiFi are working.",
  },
  off: {
    badge: "OFF",
    title: "Data is off",
    sub: "Cellular and home WiFi are blocked.",
  },
  mixed: {
    badge: "MIXED",
    title: "Only partly switched",
    sub: "The services below don’t match.",
  },
  unknown: {
    badge: "—",
    title: "Not set yet",
    sub: "Choose on or off to get started.",
  },
  offline: {
    badge: "—",
    title: "Not connected",
    sub: "The switch is unavailable until the server answers.",
  },
  loading: {
    badge: "—",
    title: "Checking…",
    sub: "Asking the server for the current state.",
  },
};

function Button({ label, onPress, disabled, color, textColor, outline, t }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        outline
          ? {
              borderWidth: 1.5,
              borderColor: t.line,
              backgroundColor: "transparent",
            }
          : { backgroundColor: color },
        (pressed || disabled) && { opacity: 0.55 },
      ]}
    >
      <Text
        style={[styles.buttonText, { color: outline ? t.text : textColor }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Settings({
  t,
  initialUrl,
  initialToken,
  canCancel,
  onSave,
  onCancel,
}) {
  const [url, setUrl] = useState(initialUrl);
  const [tok, setTok] = useState(initialToken);
  const [problem, setProblem] = useState(null);

  const submit = () => {
    const u = url.trim();
    const k = tok.trim();
    if (!/^https?:\/\//.test(u))
      return setProblem("The address must start with http:// or https://");
    if (!k) return setProblem("Enter the access code.");
    onSave(u, k);
  };

  const input = [
    styles.input,
    { backgroundColor: t.surface, borderColor: t.line, color: t.text },
  ];
  return (
    <View style={{ marginTop: 24 }}>
      <Text style={[styles.h1, { color: t.text }]}>Connect to your server</Text>
      <Text style={[styles.body, { color: t.muted }]}>
        Enter the address of the computer running Kid Data Switch and the access
        code you set on it.
      </Text>

      <Text style={[styles.label, { color: t.muted }]}>Server address</Text>
      <TextInput
        style={input}
        value={url}
        onChangeText={setUrl}
        placeholder="http://192.168.1.50:8787"
        placeholderTextColor={t.muted}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <Text style={[styles.label, { color: t.muted }]}>Access code</Text>
      <TextInput
        style={input}
        value={tok}
        onChangeText={setTok}
        placeholder="KDS_TOKEN from the server"
        placeholderTextColor={t.muted}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />
      {problem && (
        <Text style={[styles.inlineError, { color: t.danger }]}>{problem}</Text>
      )}

      <View style={{ marginTop: 24, gap: 10 }}>
        <Button
          label="Save"
          onPress={submit}
          color={t.primary}
          textColor={t.primaryText}
          t={t}
        />
        {canCancel && (
          <Button label="Cancel" onPress={onCancel} outline t={t} />
        )}
      </View>
    </View>
  );
}

export default function App() {
  const t = THEMES[useColorScheme() === "dark" ? "dark" : "light"];
  const [loaded, setLoaded] = useState(false);
  const [serverUrl, setServerUrl] = useState("");
  const [token, setToken] = useState("");
  const [editing, setEditing] = useState(false);
  const [providers, setProviders] = useState(null);
  const [working, setWorking] = useState(null); // 'on' | 'off' | null
  const [error, setError] = useState(null);

  const refresh = useCallback(async (url, tok) => {
    try {
      const json = await call(url, tok, "GET", "/status");
      setProviders(json.providers);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const url = (await storage.get(KEY_URL)) || "";
      const tok = (await storage.get(KEY_TOKEN)) || "";
      setServerUrl(url);
      setToken(tok);
      setEditing(!url || !tok);
      setLoaded(true);
      if (url && tok) refresh(url, tok);
    })();
  }, [refresh]);

  const save = async (url, tok) => {
    await storage.set(KEY_URL, url);
    await storage.set(KEY_TOKEN, tok);
    setServerUrl(url);
    setToken(tok);
    setEditing(false);
    setProviders(null);
    setError(null);
    refresh(url, tok);
  };

  const change = async (on) => {
    setWorking(on ? "on" : "off");
    setError(null);
    try {
      const json = await call(
        serverUrl,
        token,
        "POST",
        "/data",
        { on },
        CHANGE_TIMEOUT_MS,
      );
      setProviders(json.providers);
    } catch (err) {
      setError(err.message);
    } finally {
      setWorking(null);
    }
  };

  const topPad = Platform.OS === "android" ? RNStatusBar.currentHeight || 0 : 0;
  const frame = [styles.screen, { backgroundColor: t.bg, paddingTop: topPad }];

  if (!loaded) {
    return (
      <View style={[frame, styles.center]}>
        <ActivityIndicator color={t.muted} />
      </View>
    );
  }

  if (editing) {
    return (
      <SafeAreaView style={frame}>
        <StatusBar style="auto" />
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Settings
            t={t}
            initialUrl={serverUrl}
            initialToken={token}
            canCancel={!!serverUrl && !!token}
            onSave={save}
            onCancel={() => setEditing(false)}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const state = providers ? overall(providers) : error ? "offline" : "loading";
  const hero = HERO[state];
  const connected = !!providers;
  const tone = ["on", "off", "mixed"].includes(state) ? state : "off";
  const failed = (providers || []).filter((p) => p.error);

  return (
    <SafeAreaView style={frame}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.appName, { color: t.muted }]}>
            Kid Data Switch
          </Text>
          <Pressable
            onPress={() => setEditing(true)}
            disabled={!!working}
            hitSlop={12}
          >
            <Text style={[styles.headerLink, { color: t.muted }]}>
              Settings
            </Text>
          </Pressable>
        </View>

        {error && (
          <View style={[styles.banner, { backgroundColor: t.dangerSoft }]}>
            <Text style={[styles.bannerText, { color: t.danger }]}>
              {error}
            </Text>
            <Pressable
              onPress={() => refresh(serverUrl, token)}
              disabled={!!working}
              hitSlop={8}
            >
              <Text style={[styles.bannerAction, { color: t.danger }]}>
                Try again
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.hero}>
          <View
            style={[
              styles.ring,
              { backgroundColor: t[`${tone}Soft`], borderColor: t[tone] },
            ]}
          >
            {working ? (
              <ActivityIndicator size="large" color={t[tone]} />
            ) : (
              <Text style={[styles.badge, { color: t[tone] }]}>
                {hero.badge}
              </Text>
            )}
          </View>
          <Text style={[styles.h1, styles.centerText, { color: t.text }]}>
            {working
              ? working === "off"
                ? "Turning data off…"
                : "Turning data on…"
              : hero.title}
          </Text>
          <Text style={[styles.body, styles.centerText, { color: t.muted }]}>
            {working ? "This can take up to a minute." : hero.sub}
          </Text>
        </View>

        <View style={styles.actions}>
          {connected && state !== "off" && (
            <Button
              label="Turn data off"
              onPress={() => change(false)}
              disabled={!!working}
              color={t.primary}
              textColor={t.primaryText}
              t={t}
            />
          )}
          {connected && state !== "on" && (
            <Button
              label="Turn data on"
              onPress={() => change(true)}
              disabled={!!working}
              color={t.on}
              textColor={t.bg}
              outline={state !== "off"}
              t={t}
            />
          )}
        </View>

        {providers && providers.length > 0 && (
          <View style={[styles.card, { backgroundColor: t.surface }]}>
            {providers.map((p, i) => {
              const c =
                p.data === "on" ? t.on : p.data === "off" ? t.off : t.muted;
              return (
                <View
                  key={p.id}
                  style={[
                    styles.row,
                    i > 0 && { borderTopWidth: 1, borderTopColor: t.line },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: c }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowTitle, { color: t.text }]}>
                      {p.name}
                    </Text>
                    <Text style={[styles.rowSub, { color: t.muted }]}>
                      {p.changedAt
                        ? `Changed ${when(p.changedAt)}`
                        : "Never changed from this app"}
                    </Text>
                  </View>
                  <Text style={[styles.rowState, { color: c }]}>
                    {p.data === "on"
                      ? "On"
                      : p.data === "off"
                        ? "Off"
                        : "Not set"}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {failed.map((p) => (
          <View
            key={p.id}
            style={[
              styles.banner,
              styles.failure,
              { backgroundColor: t.dangerSoft },
            ]}
          >
            <Text style={[styles.failureTitle, { color: t.danger }]}>
              {p.name} didn’t change
            </Text>
            <Text style={[styles.failureText, { color: t.danger }]}>
              {p.error}
            </Text>
          </View>
        ))}

        {connected && (
          <Text style={[styles.footnote, { color: t.muted }]}>
            Shows what this app last set. Changes made in the US Mobile or Cox
            apps won’t appear here.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  centerText: { textAlign: "center" },
  content: {
    padding: 20,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appName: { fontSize: 15, fontWeight: "600" },
  headerLink: { fontSize: 15 },
  hero: { alignItems: "center", marginTop: 28, marginBottom: 28 },
  ring: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  badge: { fontSize: 34, fontWeight: "800", letterSpacing: 1 },
  h1: { fontSize: 26, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 22, marginTop: 6 },
  actions: { gap: 10 },
  button: {
    borderRadius: 14,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  buttonText: { fontSize: 17, fontWeight: "600" },
  card: { borderRadius: 16, marginTop: 28, paddingHorizontal: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { fontSize: 16, fontWeight: "600" },
  rowSub: { fontSize: 13, marginTop: 2 },
  rowState: { fontSize: 16, fontWeight: "600" },
  banner: {
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  bannerText: { flex: 1, fontSize: 14, lineHeight: 19 },
  bannerAction: { fontSize: 14, fontWeight: "700" },
  failure: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    marginTop: 12,
  },
  failureTitle: { fontSize: 15, fontWeight: "700" },
  failureText: { fontSize: 13, lineHeight: 18 },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 24,
  },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 20 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  inlineError: { fontSize: 14, marginTop: 12 },
});
