import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/providers/session-provider';

export default function RequestMoneyLayout() {
  const { isAuthenticated, isBootstrapping } = useSession();

  if (isBootstrapping) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[requestRef]" />
      <Stack.Screen name="review" />
      <Stack.Screen name="pay" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
