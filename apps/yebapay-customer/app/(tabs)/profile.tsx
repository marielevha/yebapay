import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';
import { useSession } from '@/providers/session-provider';

const SECURITY_ITEMS = [
  {
    icon: 'shield',
    titleKey: 'profile.security.pin.title',
    subtitleKey: 'profile.security.pin.subtitle',
  },
  {
    icon: 'lock-reset',
    titleKey: 'profile.security.password.title',
    subtitleKey: 'profile.security.password.subtitle',
  },
  {
    icon: 'receipt-long',
    titleKey: 'profile.security.personalQr.title',
    subtitleKey: 'profile.security.personalQr.subtitle',
  },
] as const;

const ACCOUNT_SECTIONS = [
  {
    icon: 'person-outline',
    titleKey: 'profile.structure.personalInfo.title',
    subtitleKey: 'profile.structure.personalInfo.subtitle',
  },
  {
    icon: 'storefront',
    titleKey: 'profile.structure.merchantMode.title',
    subtitleKey: 'profile.structure.merchantMode.subtitle',
  },
  {
    icon: 'support-agent',
    titleKey: 'profile.structure.support.title',
    subtitleKey: 'profile.structure.support.subtitle',
  },
] as const;

const PROFILE_PREVIEW = {
  fullName: 'Maeva Ngoma',
  phoneNumber: '242060123456',
} as const;

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t } = useI18n();
  const { signOut } = useSession();
  const [loggingOut, setLoggingOut] = useState(false);

  const securityItems = SECURITY_ITEMS.map((item) => ({
    ...item,
    title: t(item.titleKey),
    subtitle: t(item.subtitleKey),
  }));
  const accountSections = ACCOUNT_SECTIONS.map((item) => ({
    ...item,
    title: t(item.titleKey),
    subtitle: t(item.subtitleKey),
  }));

  const handleSignOut = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await signOut();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: palette.hero }, BrandShadow.card]}>
          <View style={styles.heroHeader}>
            <View style={styles.avatarWrap}>
              <BrandMark size={62} />
            </View>
            <View style={styles.heroCopy}>
              <ThemedText type="eyebrow" lightColor={palette.heroText} darkColor={palette.heroText}>
                {t('profile.hero.eyebrow')}
              </ThemedText>
              <ThemedText type="title" lightColor={palette.heroText} darkColor={palette.heroText}>
                {PROFILE_PREVIEW.fullName}
              </ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.heroText} darkColor={palette.heroText}>
                {PROFILE_PREVIEW.phoneNumber}
              </ThemedText>
            </View>
          </View>

          <View style={styles.heroPills}>
            <View style={[styles.heroPill, { backgroundColor: 'rgba(250, 250, 247, 0.14)' }]}>
              <ThemedText type="bodySmall" lightColor={palette.heroText} darkColor={palette.heroText}>
                {t('profile.hero.kycLevel')}
              </ThemedText>
            </View>
            <View style={[styles.heroPill, { backgroundColor: 'rgba(250, 250, 247, 0.14)' }]}>
              <ThemedText type="bodySmall" lightColor={palette.heroText} darkColor={palette.heroText}>
                {t('profile.hero.walletStatus')}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">{t('profile.security.title')}</ThemedText>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('profile.security.subtitle')}
          </ThemedText>
        </View>

        {securityItems.map((item) => (
          <View
            key={item.titleKey}
            style={[
              styles.rowCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <View style={[styles.rowIconWrap, { backgroundColor: palette.card }]}>
              <MaterialIcons name={item.icon} size={22} color={palette.tint} />
            </View>
            <View style={styles.rowCopy}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {item.subtitle}
              </ThemedText>
            </View>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">{t('profile.structure.title')}</ThemedText>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('profile.structure.subtitle')}
          </ThemedText>
        </View>

        {accountSections.map((section) => (
          <View
            key={section.titleKey}
            style={[
              styles.secondaryCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}>
            <View style={styles.secondaryTop}>
              <View style={[styles.secondaryIconWrap, { backgroundColor: palette.surface }]}>
                <MaterialIcons name={section.icon} size={22} color={palette.text} />
              </View>
              <MaterialIcons name="chevron-right" size={22} color={palette.textMuted} />
            </View>
            <ThemedText type="defaultSemiBold">{section.title}</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {section.subtitle}
            </ThemedText>
          </View>
        ))}

        <View
          style={[
            styles.noteCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}>
          <ThemedText type="sectionTitle">{t('profile.note.title')}</ThemedText>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('profile.note.description')}
          </ThemedText>
        </View>

        <AuthPrimaryButton
          label={t('profile.actions.logout')}
          loadingLabel={t('profile.actions.loggingOut')}
          loading={loggingOut}
          onPress={handleSignOut}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 18,
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    gap: 18,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(250, 250, 247, 0.14)',
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeader: {
    gap: 4,
    marginTop: 4,
  },
  rowCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  rowIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  secondaryCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  secondaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secondaryIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
});
