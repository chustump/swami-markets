import { Caveat_600SemiBold, useFonts } from '@expo-google-fonts/caveat';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import '@/global.css';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Caveat_600SemiBold });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0d0f14' },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="assessment/[index]" options={{ gestureEnabled: false }} />
        <Stack.Screen name="assessment/tiebreak" options={{ gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ gestureEnabled: false }} />
        <Stack.Screen name="onboarding/setup" options={{ gestureEnabled: false }} />
        <Stack.Screen name="home" options={{ gestureEnabled: false }} />
      </Stack>
    </>
  );
}
