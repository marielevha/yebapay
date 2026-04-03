import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';

const QUICK_ACTIONS = [
  {
    icon: 'qr-code-scanner',
    titleKey: 'home.quickActions.payByQr.title',
    descriptionKey: 'home.quickActions.payByQr.description',
  },
  {
    icon: 'swap-horiz',
    titleKey: 'home.quickActions.send.title',
    descriptionKey: 'home.quickActions.send.description',
  },
  {
    icon: 'request-page',
    titleKey: 'home.quickActions.request.title',
    descriptionKey: 'home.quickActions.request.description',
  },
  {
    icon: 'badge',
    titleKey: 'home.quickActions.receive.title',
    descriptionKey: 'home.quickActions.receive.description',
  },
] as const;

const BACKEND_ITEM_KEYS = [
  'home.backend.items.auth',
  'home.backend.items.wallet',
  'home.backend.items.p2p',
  'home.backend.items.request',
  'home.backend.items.merchant',
  'home.backend.items.qr',
] as const;

const HERO_PILLAR_KEYS = [
  'home.hero.pillars.fees',
  'home.hero.pillars.fast',
  'home.hero.pillars.history',
] as const;

const PROMISE_CARDS = [
  {
    icon: 'visibility',
    titleKey: 'home.promise.visibleFees.title',
    descriptionKey: 'home.promise.visibleFees.description',
  },
  {
    icon: 'bolt',
    titleKey: 'home.promise.counterFast.title',
    descriptionKey: 'home.promise.counterFast.description',
  },
  {
    icon: 'history',
    titleKey: 'home.promise.traceable.title',
    descriptionKey: 'home.promise.traceable.description',
  },
] as const;

const BALANCE_PREVIEW = {
  total: '24 350 FCFA',
  available: '24 350 FCFA',
} as const;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t } = useI18n();

  const quickActions = QUICK_ACTIONS.map((action) => ({
    ...action,
    title: t(action.titleKey),
    description: t(action.descriptionKey),
  }));
  const backendReadiness = BACKEND_ITEM_KEYS.map((key) => t(key));
  const heroPillars = HERO_PILLAR_KEYS.map((key) => t(key));
  const promiseCards = PROMISE_CARDS.map((card) => ({
    ...card,
    title: t(card.titleKey),
    description: t(card.descriptionKey),
  }));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: palette.hero }, BrandShadow.card]}>
          <View style={[styles.heroGlowPrimary, { backgroundColor: palette.heroSecondary }]} />
          <View style={[styles.heroGlowSecondary, { backgroundColor: palette.warning }]} />

          <View style={styles.heroHeader}>
            <BrandMark size={58} />
            <View style={styles.heroHeaderCopy}>
              <ThemedText type="eyebrow" lightColor={palette.heroText} darkColor={palette.heroText}>
                {t('common.walletQr')}
              </ThemedText>
              <ThemedText
                type="sectionTitle"
                lightColor={palette.heroText}
                darkColor={palette.heroText}>
                {Brand.name}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="hero" lightColor={palette.heroText} darkColor={palette.heroText}>
            {t('brand.slogan')}
          </ThemedText>
          <ThemedText
            type="bodySmall"
            style={styles.heroBody}
            lightColor={palette.heroText}
            darkColor={palette.heroText}>
            {t('home.hero.body')}
          </ThemedText>

          <View style={styles.heroPills}>
            {heroPillars.map((pillar) => (
              <View
                key={pillar}
                style={[styles.heroPill, { backgroundColor: 'rgba(250, 250, 247, 0.14)' }]}>
                <ThemedText type="bodySmall" lightColor={palette.heroText} darkColor={palette.heroText}>
                  {pillar}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">{t('home.balance.title')}</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {t('home.balance.subtitle')}
            </ThemedText>
          </View>
          <View style={[styles.liveBadge, { backgroundColor: palette.card }]}>
            <ThemedText type="eyebrow" lightColor={palette.tint} darkColor={palette.tint}>
              {t('common.mvp')}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            BrandShadow.card,
          ]}>
          <View style={styles.balanceHeader}>
            <View>
              <ThemedText type="eyebrow" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {t('common.ordinaryAccount')}
              </ThemedText>
              <ThemedText type="balance">{BALANCE_PREVIEW.total}</ThemedText>
            </View>
            <View style={[styles.balanceIconWrap, { backgroundColor: palette.card }]}>
              <MaterialIcons name="account-balance-wallet" size={26} color={palette.tint} />
            </View>
          </View>

          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {t('common.available')}
              </ThemedText>
              <ThemedText type="defaultSemiBold">{BALANCE_PREVIEW.available}</ThemedText>
            </View>
            <View style={styles.balanceStat}>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {t('home.balance.lastActivityLabel')}
              </ThemedText>
              <ThemedText type="defaultSemiBold">{t('home.balance.lastActivityValue')}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">{t('home.quickActions.title')}</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {t('home.quickActions.subtitle')}
            </ThemedText>
          </View>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <View
              key={action.titleKey}
              style={[
                styles.quickCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}>
              <View style={[styles.quickIconWrap, { backgroundColor: palette.card }]}>
                <MaterialIcons name={action.icon} size={26} color={palette.tint} />
              </View>
              <ThemedText type="defaultSemiBold">{action.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {action.description}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">{t('home.backend.title')}</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {t('home.backend.subtitle')}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.backendCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}>
          {backendReadiness.map((item) => (
            <View key={item} style={styles.backendRow}>
              <View style={[styles.backendDot, { backgroundColor: palette.success }]} />
              <ThemedText>{item}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">{t('home.promise.title')}</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {t('home.promise.subtitle')}
            </ThemedText>
          </View>
        </View>

        {promiseCards.map((card) => (
          <View
            key={card.titleKey}
            style={[
              styles.promiseCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}>
            <View style={[styles.promiseIconWrap, { backgroundColor: palette.surface }]}>
              <MaterialIcons name={card.icon} size={24} color={palette.text} />
            </View>
            <View style={styles.promiseCopy}>
              <ThemedText type="defaultSemiBold">{card.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {card.description}
              </ThemedText>
            </View>
          </View>
        ))}
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
    overflow: 'hidden',
    borderRadius: 28,
    padding: 22,
    gap: 18,
    minHeight: 270,
  },
  heroGlowPrimary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -80,
    right: -50,
    opacity: 0.18,
  },
  heroGlowSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: -54,
    left: -24,
    opacity: 0.16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroHeaderCopy: {
    gap: 2,
  },
  heroBody: {
    maxWidth: '92%',
    opacity: 0.9,
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 4,
  },
  liveBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balanceCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 18,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  balanceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    gap: 18,
  },
  balanceStat: {
    flex: 1,
    gap: 6,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backendCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  backendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  promiseCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  promiseIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseCopy: {
    flex: 1,
    gap: 6,
  },
});
