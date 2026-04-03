import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { useI18n } from '@/i18n/provider';
import { useOnboarding } from '@/providers/onboarding-provider';
import { useSession } from '@/providers/session-provider';

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useI18n();
  const {
    hasSeenOnboarding,
    isBootstrapping: isOnboardingBootstrapping,
    markOnboardingSeen,
  } = useOnboarding();
  const { isAuthenticated, isBootstrapping: isSessionBootstrapping } = useSession();
  const slides = [
    {
      key: 'pay',
      image: require('../assets/onboarding/slide-city.png'),
      title: t('onboarding.slides.pay.title'),
      description: t('onboarding.slides.pay.description'),
    },
    {
      key: 'money',
      image: require('../assets/onboarding/slide-wallet.png'),
      title: t('onboarding.slides.money.title'),
      description: t('onboarding.slides.money.description'),
    },
    {
      key: 'qr',
      image: require('../assets/onboarding/slide-scan.png'),
      title: t('onboarding.slides.qr.title'),
      description: t('onboarding.slides.qr.description'),
    },
  ] as const;
  const flatListRef = useRef<FlatList<(typeof slides)[number]>>(null);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(nextIndex);
  };

  const handleContinue = async () => {
    if (currentIndex === slides.length - 1) {
      await markOnboardingSeen();
      router.replace('/(auth)/login');
      return;
    }

    flatListRef.current?.scrollToIndex({
      index: currentIndex + 1,
      animated: true,
    });
    setCurrentIndex((value) => value + 1);
  };

  if (isOnboardingBootstrapping || isSessionBootstrapping) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (hasSeenOnboarding) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumEnd}
        keyExtractor={(item) => item.key}
        renderItem={({ item, index }) => {
          const isLast = index === slides.length - 1;

          return (
            <View style={[styles.slide, { width, height }]}>
              <Image source={item.image} style={StyleSheet.absoluteFill} contentFit="cover" />
              <View style={styles.slideOverlay} />
              <View style={styles.bottomShade} />

              <SafeAreaView style={styles.slideSafeArea}>
                <View style={styles.badgeWrap}>
                  <BrandMark size={40} />
                </View>

                <View style={styles.contentWrap}>
                  <View style={styles.copyBlock}>
                    <ThemedText type="hero" style={styles.title} lightColor={BrandColors.white}>
                      {item.title}
                    </ThemedText>
                    <ThemedText
                      type="default"
                      style={styles.description}
                      lightColor="rgba(255, 255, 255, 0.82)">
                      {item.description}
                    </ThemedText>
                  </View>

                  <View style={styles.footer}>
                    <View style={styles.pagination}>
                      {slides.map((slide, dotIndex) => {
                        const active = dotIndex === currentIndex;

                        return (
                          <View
                            key={slide.key}
                            style={[
                              styles.dot,
                              active ? styles.dotActive : styles.dotInactive,
                            ]}
                          />
                        );
                      })}
                    </View>

                    <Pressable onPress={() => void handleContinue()} style={[styles.button, BrandShadow.card]}>
                      <ThemedText type="defaultSemiBold" style={styles.buttonLabel} lightColor={BrandColors.white}>
                        {isLast ? t('common.getStarted') : t('common.continue')}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BrandColors.black,
  },
  slide: {
    backgroundColor: BrandColors.black,
  },
  slideOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 9, 10, 0.32)',
  },
  bottomShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '48%',
    backgroundColor: 'rgba(5, 9, 10, 0.52)',
  },
  slideSafeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  badgeWrap: {
    marginTop: 8,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 250, 247, 0.14)',
  },
  contentWrap: {
    paddingBottom: 24,
    gap: 28,
  },
  copyBlock: {
    gap: 14,
  },
  title: {
    textAlign: 'center',
    fontSize: 34,
    lineHeight: 40,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 14,
  },
  footer: {
    gap: 18,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  dotActive: {
    width: 24,
    backgroundColor: BrandColors.sun,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  button: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.palm,
  },
  buttonLabel: {
    textAlign: 'center',
  },
});
