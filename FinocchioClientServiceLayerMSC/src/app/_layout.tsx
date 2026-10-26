import '../../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';

import ApplicationGoogleAuthService from '@/Services/ApplicationGoogleAuthService';

const queryClient = new QueryClient();

ApplicationGoogleAuthService.current.configure();

export default function RootLayout(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
