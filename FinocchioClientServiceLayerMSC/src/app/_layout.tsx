import '../../global.css';

import { PirataOne_400Regular, useFonts } from '@expo-google-fonts/pirata-one';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// TODO: Google Sign-In is commented out -- it's a real native module
// (TurboModuleRegistry lookup happens at import time, not when called), which
// doesn't exist in Expo Go and crashes the app immediately on load. Re-enable
// this import + the configure() call once testing moves to the custom dev
// client (see ARCHITECTURE.md's "no plain Expo Go" note).
// import ApplicationGoogleAuthService from '@/Services/ApplicationGoogleAuthService';

const queryClient = new QueryClient();

// ApplicationGoogleAuthService.current.configure();

// Keeps the native splash screen up until Pirata One finishes loading, so
// nothing ever renders with a fallback system font -- must run at module
// scope, before the first render.
SplashScreen.preventAutoHideAsync();

export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded, fontError] = useFonts({ PirataOne_400Regular });
  // A failed font load must not brick the app forever -- treat it the same
  // as "ready" (falling back to the system font for Pirata One's two usages)
  // rather than returning null indefinitely with no way to recover. Logged
  // so a real failure is still visible, not silently swallowed.
  const isReadyToRender = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontError) {
      console.error('Pirata One failed to load, falling back to system font:', fontError);
    }
    if (isReadyToRender) {
      void SplashScreen.hideAsync();
    }
  }, [isReadyToRender, fontError]);

  if (!isReadyToRender) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
