import { Redirect, Stack, usePathname } from 'expo-router';

import { useSession } from '@/providers/session-provider';

export default function AuthLayout() {
  const pathname = usePathname();
  const { isAuthenticated, isBootstrapping } = useSession();
  const allowedAuthenticatedRoutes = new Set([
    '/register',
    '/secure-wallet',
    '/account-created',
    '/(auth)/register',
    '/(auth)/secure-wallet',
    '/(auth)/account-created',
  ]);

  if (isBootstrapping) {
    return null;
  }

  if (isAuthenticated && !allowedAuthenticatedRoutes.has(pathname)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="secure-wallet" />
      <Stack.Screen name="account-created" />
      <Stack.Screen name="password-reset-success" />
    </Stack>
  );
}
