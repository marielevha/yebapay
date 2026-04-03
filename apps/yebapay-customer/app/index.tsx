import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { useI18n } from '@/i18n/provider';
import { useOnboarding } from '@/providers/onboarding-provider';
import { useSession } from '@/providers/session-provider';

export default function SplashEntryScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const hasScheduledNavigation = useRef(false);
  const { t } = useI18n();
  const { isAuthenticated, isBootstrapping } = useSession();
  const {
    hasSeenOnboarding,
    isBootstrapping: isOnboardingBootstrapping,
  } = useOnboarding();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale, translateY]);

  useEffect(() => {
    if (isBootstrapping || isOnboardingBootstrapping || hasScheduledNavigation.current) {
      return;
    }

    hasScheduledNavigation.current = true;
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
        return;
      }

      router.replace(hasSeenOnboarding ? '/(auth)/login' : '/onboarding');
    }, 1800);

    return () => clearTimeout(timeout);
  }, [hasSeenOnboarding, isAuthenticated, isBootstrapping, isOnboardingBootstrapping]);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroGlowTop} />
        <View style={styles.heroGlowBottom} />

        <Animated.View
          style={[
            styles.centerWrap,
            {
              opacity,
              transform: [{ scale }, { translateY }],
            },
          ]}>
          <Image
            source={require('../assets/brand/yebapay-wordmark.png')}
            style={styles.wordmark}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity }]}>
          <ThemedText type="bodySmall" style={styles.footerText} lightColor={BrandColors.cloud}>
            {t('brand.productLine')}
          </ThemedText>
          <ThemedText type="bodySmall" style={styles.footerSubtext} lightColor="rgba(250, 250, 247, 0.68)">
            {t('brand.splashSubtitle')}
          </ThemedText>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.palm,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  heroGlowTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(244, 232, 209, 0.12)',
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -160,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(14, 21, 19, 0.14)',
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    width: 238,
    height: 90,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
    gap: 4,
  },
  footerText: {
    textAlign: 'center',
  },
  footerSubtext: {
    textAlign: 'center',
    maxWidth: 290,
  },
});
