import { MaterialIcons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';

type TransferScreenShellProps = {
  title: string;
  subtitle?: string;
  stepLabel?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  contentSurface?: 'card' | 'plain';
};

export function TransferScreenShell({
  title,
  subtitle,
  stepLabel,
  onBack,
  children,
  footer,
  contentSurface = 'card',
}: TransferScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.flex}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.headerBar}>
          <Pressable onPress={onBack} hitSlop={8} style={[styles.headerAction, BrandShadow.card]}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color={BrandColors.ink} />
          </Pressable>

          <View style={styles.headerBrand}>
            <View style={styles.brandBadge}>
              <BrandMark size={28} />
            </View>
            <ThemedText type="defaultSemiBold">YebaPay</ThemedText>
          </View>

          <View style={styles.headerGhost} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.copy}>
            {stepLabel ? (
              <ThemedText type="eyebrow" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
                {stepLabel}
              </ThemedText>
            ) : null}
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            {subtitle ? (
              <ThemedText type="default" style={styles.subtitle} lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {subtitle}
              </ThemedText>
            ) : null}
          </View>

          {contentSurface === 'card' ? <View style={[styles.card, BrandShadow.card]}>{children}</View> : children}
        </ScrollView>

        {footer ? <View style={styles.footer}>{footer}</View> : null}
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
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(30, 107, 91, 0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(244, 232, 209, 0.84)',
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFE9E2',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  headerGhost: {
    width: 44,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 18,
  },
  copy: {
    gap: 8,
  },
  title: {
    maxWidth: 320,
  },
  subtitle: {
    maxWidth: 340,
  },
  card: {
    borderRadius: 28,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#E4ECE7',
    gap: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
});
