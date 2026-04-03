import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';

const TRANSACTION_PREVIEW = [
  {
    icon: 'north-east',
    titleKey: 'activity.transactions.sent.title',
    subtitleKey: 'activity.transactions.sent.subtitle',
    amount: '-1 005 FCFA',
    statusKey: 'activity.transactions.sent.status',
  },
  {
    icon: 'south-west',
    titleKey: 'activity.transactions.requestPaid.title',
    subtitleKey: 'activity.transactions.requestPaid.subtitle',
    amount: '+1 500 FCFA',
    statusKey: 'activity.transactions.requestPaid.status',
  },
  {
    icon: 'storefront',
    titleKey: 'activity.transactions.merchantPayment.title',
    subtitleKey: 'activity.transactions.merchantPayment.subtitle',
    amount: '-500 FCFA',
    statusKey: 'activity.transactions.merchantPayment.status',
  },
] as const;

const PENDING_REQUESTS = [
  {
    titleKey: 'activity.requests.transport.title',
    subtitleKey: 'activity.requests.transport.subtitle',
    amount: '2 000 FCFA',
  },
  {
    titleKey: 'activity.requests.birthday.title',
    subtitleKey: 'activity.requests.birthday.subtitle',
    amount: '5 000 FCFA',
  },
] as const;

const PATTERN_KEYS = [
  'activity.pattern.timeline',
  'activity.pattern.requests',
  'activity.pattern.receipts',
] as const;

export default function ActivityScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t } = useI18n();

  const transactionPreview = TRANSACTION_PREVIEW.map((item) => ({
    ...item,
    title: t(item.titleKey),
    subtitle: t(item.subtitleKey),
    status: t(item.statusKey),
  }));
  const pendingRequests = PENDING_REQUESTS.map((item) => ({
    ...item,
    title: t(item.titleKey),
    subtitle: t(item.subtitleKey),
  }));
  const patternItems = PATTERN_KEYS.map((key) => t(key));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            BrandShadow.card,
          ]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIconWrap, { backgroundColor: palette.card }]}>
              <MaterialIcons name="schedule" size={28} color={palette.tint} />
            </View>
            <View style={styles.heroCopy}>
              <ThemedText type="eyebrow" lightColor={palette.tint} darkColor={palette.tint}>
                {t('activity.hero.eyebrow')}
              </ThemedText>
              <ThemedText type="title">{t('activity.hero.title')}</ThemedText>
            </View>
          </View>

          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('activity.hero.description')}
          </ThemedText>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: palette.card }]}>
              <ThemedText type="eyebrow" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {t('activity.stats.today')}
              </ThemedText>
              <ThemedText type="defaultSemiBold">{t('activity.stats.todayValue')}</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: palette.card }]}>
              <ThemedText type="eyebrow" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {t('activity.stats.pending')}
              </ThemedText>
              <ThemedText type="defaultSemiBold">{t('activity.stats.pendingValue')}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">{t('activity.transactions.title')}</ThemedText>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('activity.transactions.subtitle')}
          </ThemedText>
        </View>

        {transactionPreview.map((item) => (
          <View
            key={`${item.titleKey}-${item.amount}`}
            style={[
              styles.transactionCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <View style={[styles.transactionIconWrap, { backgroundColor: palette.card }]}>
              <MaterialIcons name={item.icon} size={22} color={palette.tint} />
            </View>
            <View style={styles.transactionCopy}>
              <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {item.subtitle}
              </ThemedText>
            </View>
            <View style={styles.amountColumn}>
              <ThemedText type="defaultSemiBold">{item.amount}</ThemedText>
              <View style={[styles.statusPill, { backgroundColor: palette.card }]}>
                <ThemedText type="bodySmall" lightColor={palette.tint} darkColor={palette.tint}>
                  {item.status}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">{t('activity.requests.title')}</ThemedText>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('activity.requests.subtitle')}
          </ThemedText>
        </View>

        {pendingRequests.map((request) => (
          <View
            key={request.titleKey}
            style={[
              styles.requestCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}>
            <View style={styles.requestCopy}>
              <ThemedText type="defaultSemiBold">{request.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {request.subtitle}
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold">{request.amount}</ThemedText>
          </View>
        ))}

        <View
          style={[
            styles.patternCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}>
          <ThemedText type="sectionTitle">{t('activity.pattern.title')}</ThemedText>
          <View style={styles.patternList}>
            {patternItems.map((item) => (
              <View key={item} style={styles.patternRow}>
                <MaterialIcons name="done" size={18} color={palette.success} />
                <ThemedText type="bodySmall" style={styles.patternText}>
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
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
    borderWidth: 1,
    padding: 20,
    gap: 18,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    gap: 6,
  },
  sectionHeader: {
    marginTop: 4,
    gap: 4,
  },
  transactionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionCopy: {
    flex: 1,
    gap: 4,
  },
  amountColumn: {
    alignItems: 'flex-end',
    gap: 8,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  requestCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  requestCopy: {
    flex: 1,
    gap: 4,
  },
  patternCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  patternList: {
    gap: 12,
  },
  patternRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  patternText: {
    flex: 1,
  },
});
