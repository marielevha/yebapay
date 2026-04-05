import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/providers/session-provider';

export default function TransferLayout() {
  const { isAuthenticated, isBootstrapping } = useSession();

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="recipient" />
      <Stack.Screen name="beneficiary-new" />
      <Stack.Screen name="beneficiary-scan" />
      <Stack.Screen name="amount" />
      <Stack.Screen name="confirm" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
