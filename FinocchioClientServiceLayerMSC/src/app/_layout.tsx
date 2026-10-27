import '../../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';

// TODO: Google Sign-In is commented out -- it's a real native module
// (TurboModuleRegistry lookup happens at import time, not when called), which
// doesn't exist in Expo Go and crashes the app immediately on load. Re-enable
// this import + the configure() call once testing moves to the custom dev
// client (see ARCHITECTURE.md's "no plain Expo Go" note).
// import ApplicationGoogleAuthService from '@/Services/ApplicationGoogleAuthService';

const queryClient = new QueryClient();

// ApplicationGoogleAuthService.current.configure();

export default function RootLayout(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
