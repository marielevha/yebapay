import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';

type AuthScreenShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footerPrompt?: string;
  footerCtaLabel?: string;
  onFooterPress?: () => void;
  topNote?: string;
};

export function AuthScreenShell({
  title,
  subtitle,
  children,
  footerPrompt,
  footerCtaLabel,
  onFooterPress,
  topNote,
}: AuthScreenShellProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 390;
  const horizontalPadding = isSmallScreen ? 16 : 24;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerGlowTop} />
          <View style={styles.headerGlowBottom} />

          <View style={styles.header}>
            <View style={styles.brandBadge}>
              <BrandMark size={42} />
            </View>
            <ThemedText type="eyebrow" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
              YebaPay
            </ThemedText>
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText type="default" style={styles.subtitle} lightColor={BrandColors.slate}>
                {subtitle}
              </ThemedText>
            ) : null}
            {topNote ? (
              <View style={styles.notePill}>
                <ThemedText type="bodySmall" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
                  {topNote}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={[styles.formCard, BrandShadow.card]}>{children}</View>

          {footerPrompt && footerCtaLabel && onFooterPress ? (
            <View style={styles.footer}>
              <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {footerPrompt}{' '}
              </ThemedText>
              <Pressable onPress={onFooterPress} hitSlop={8}>
                <ThemedText type="link" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
                  {footerCtaLabel}
                </ThemedText>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.cloud,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: 'center',
    gap: 18,
  },
  headerGlowTop: {
    position: 'absolute',
    top: -80,
    right: -36,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(30, 107, 91, 0.08)',
  },
  headerGlowBottom: {
    position: 'absolute',
    bottom: 10,
    left: -48,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(244, 232, 209, 0.72)',
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  brandBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  title: {
    textAlign: 'center',
    maxWidth: 320,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 320,
  },
  notePill: {
    marginTop: 2,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(30, 107, 91, 0.08)',
  },
  formCard: {
    borderRadius: 30,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E4ECE7',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});
