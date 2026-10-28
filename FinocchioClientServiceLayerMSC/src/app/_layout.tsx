import '../../global.css';

import { PirataOne_400Regular, useFonts } from '@expo-google-fonts/pirata-one';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';

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
  const [fontsLoaded] = useFonts({ PirataOne_400Regular });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
