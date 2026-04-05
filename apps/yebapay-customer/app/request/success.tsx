import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { useTransactionDetails } from '@/features/wallet/use-transaction-details';
import { useI18n } from '@/i18n/provider';

function formatMoney(value: number, currencyDisplayCode: string, language: string) {
  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ${currencyDisplayCode}`;
}

function formatDateTime(value: string, language: string) {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
        {label}
      </ThemedText>
      <View style={styles.detailLeader} />
      <ThemedText type={strong ? 'defaultSemiBold' : 'bodySmall'} style={styles.detailValue}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function MoneyRequestSuccessScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId?: string }>();
  const { t, language } = useI18n();
  const { transaction, isLoading, errorMessage } = useTransactionDetails(transactionId);

  if (!transactionId) {
    return <Redirect href="/request" />;
  }

  return (
    <TransferScreenShell
      title={t('requestMoney.success.title')}
      onBack={() => router.replace('/(tabs)')}
      contentSurface="plain"
      topBarVariant="title"
      copyTitleHidden
      footer={
        <AuthPrimaryButton
          label={t('requestMoney.success.returnHome')}
          onPress={() => router.replace('/(tabs)')}
        />
      }>
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={BrandColors.palm} />
        </View>
      ) : errorMessage ? (
        <AuthFormAlert message={errorMessage} />
      ) : transaction ? (
        <View style={styles.layout}>
          <View style={styles.hero}>
            <View style={styles.heroRings}>
              <View style={styles.heroRingOuter} />
              <View style={styles.heroRingMiddle} />
              <View style={styles.heroBadge}>
                <MaterialIcons name="check" size={30} color={BrandColors.white} />
              </View>
            </View>

            <ThemedText type="title" style={styles.heroTitle}>
              {t('requestMoney.success.title')}
            </ThemedText>
            <ThemedText
              type="default"
              style={styles.heroSubtitle}
              lightColor={BrandColors.slate}
              darkColor={BrandColors.slate}>
              {t('requestMoney.success.subtitle')}
            </ThemedText>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() =>
                router.replace({
                  pathname: '/transactions/[transactionId]',
                  params: {
                    transactionId: transaction.id,
                    backTo: 'transactions',
                  },
                })
              }
              style={styles.secondaryButton}>
              <MaterialIcons name="receipt-long" size={18} color={BrandColors.ink} />
              <ThemedText type="defaultSemiBold">{t('requestMoney.success.viewTransaction')}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.section}>
            <DetailRow
              label={t('transactionsPage.details.fromLabel')}
              value={transaction.sourceWalletNumber ?? '-'}
            />
            <DetailRow
              label={t('transactionsPage.details.toLabel')}
              value={transaction.payeeDisplayName ?? transaction.counterpartyDisplayName ?? '-'}
            />
            <DetailRow label={t('transfer.summary.reference')} value={transaction.transactionRef} />
            <DetailRow
              label={t('transfer.summary.date')}
              value={formatDateTime(transaction.completedAt ?? transaction.initiatedAt, language)}
            />
            <DetailRow
              label={t('transfer.summary.amount')}
              value={formatMoney(transaction.amount, transaction.currencyDisplayCode, language)}
            />
            <DetailRow
              label={t('transfer.summary.fees')}
              value={formatMoney(transaction.feeAmount, transaction.currencyDisplayCode, language)}
            />
            <DetailRow
              label={t('transfer.summary.totalDebit')}
              value={formatMoney(transaction.totalDebit, transaction.currencyDisplayCode, language)}
              strong
            />
          </View>

          {transaction.description ? (
            <View style={styles.noteSection}>
              <ThemedText type="sectionTitle">{t('requestMoney.detail.note')}</ThemedText>
              <ThemedText type="default">{transaction.description}</ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}
    </TransferScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layout: {
    gap: 24,
    paddingBottom: 8,
  },
  hero: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 8,
  },
  heroRings: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingOuter: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: 'rgba(30, 107, 91, 0.14)',
  },
  heroRingMiddle: {
    position: 'absolute',
    width: 102,
    height: 102,
    borderRadius: 51,
    borderWidth: 1,
    borderColor: 'rgba(30, 107, 91, 0.22)',
  },
  heroBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.palm,
  },
  heroTitle: {
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
    maxWidth: 280,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  secondaryButton: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  section: {
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLeader: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE6E0',
    borderStyle: 'dashed',
  },
  detailValue: {
    maxWidth: '56%',
    textAlign: 'right',
  },
  noteSection: {
    gap: 10,
  },
});
