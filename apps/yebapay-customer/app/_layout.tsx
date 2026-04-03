import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TranslationProvider, useI18n } from '@/i18n/provider';
import { OnboardingProvider } from '@/providers/onboarding-provider';
import { SessionProvider } from '@/providers/session-provider';

export default function RootLayout() {
  return (
    <TranslationProvider>
      <OnboardingProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </OnboardingProvider>
    </TranslationProvider>
  );
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { t } = useI18n();
  const palette = Colors[colorScheme ?? 'light'];
  const navigationTheme: Theme =
    colorScheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: palette.tint,
            background: palette.background,
            card: palette.surface,
            text: palette.text,
            border: palette.border,
            notification: palette.warning,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: palette.tint,
            background: palette.background,
            card: palette.surface,
            text: palette.text,
            border: palette.border,
            notification: palette.warning,
          },
        };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: t('common.returnHome') }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
