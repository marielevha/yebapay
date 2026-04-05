import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { useTransactionDetails } from '@/features/wallet/use-transaction-details';
import { useI18n } from '@/i18n/provider';

function formatMoney(value: number, currencyDisplayCode: string, language: string) {
  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ${currencyDisplayCode}`;
}

function ReceiptRow({
  label,
  value,
  strong = false,
  isLast = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.receiptRow, isLast ? styles.receiptRowLast : undefined]}>
      <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
        {label}
      </ThemedText>
      <ThemedText type={strong ? 'defaultSemiBold' : 'bodySmall'} style={styles.receiptValue}>
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

  const transactionDate = transaction
    ? new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date(transaction.completedAt ?? transaction.initiatedAt))
    : null;

  return (
    <TransferScreenShell
      title={t('requestMoney.success.title')}
      subtitle={t('requestMoney.success.subtitle')}
      onBack={() => router.replace('/(tabs)')}
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
        <>
          <View style={styles.successBadgeWrap}>
            <View style={[styles.successBadge, BrandShadow.card]}>
              <ThemedText type="title" lightColor={BrandColors.white} darkColor={BrandColors.white}>
                ✓
              </ThemedText>
            </View>
          </View>

          <View style={[styles.receiptCard, BrandShadow.card]}>
            <ThemedText type="sectionTitle">{t('requestMoney.success.receiptTitle')}</ThemedText>

            <View style={styles.receiptRows}>
              <ReceiptRow label={t('transfer.summary.reference')} value={transaction.transactionRef} strong />
              <ReceiptRow
                label={t('requestMoney.detail.requester')}
                value={transaction.payeeDisplayName ?? transaction.counterpartyDisplayName ?? '-'}
              />
              <ReceiptRow
                label={t('transfer.summary.amount')}
                value={formatMoney(transaction.amount, transaction.currencyDisplayCode, language)}
              />
              <ReceiptRow
                label={t('transfer.summary.totalDebit')}
                value={formatMoney(transaction.totalDebit, transaction.currencyDisplayCode, language)}
                strong
              />
              <ReceiptRow label={t('transfer.summary.date')} value={transactionDate ?? '-'} isLast />
            </View>
          </View>

          <Pressable onPress={() => router.push(`/transactions/${transaction.id}`)} hitSlop={8}>
            <ThemedText type="link" style={styles.secondaryLink} lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
              {t('requestMoney.success.viewTransaction')}
            </ThemedText>
          </Pressable>
        </>
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
  successBadgeWrap: {
    alignItems: 'center',
    paddingTop: 6,
  },
  successBadge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: BrandColors.palm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiptCard: {
    borderRadius: 24,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E4ECE7',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 16,
  },
  receiptRows: {
    gap: 0,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EEE9',
  },
  receiptRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  receiptValue: {
    flex: 1,
    textAlign: 'right',
  },
  secondaryLink: {
    textAlign: 'center',
  },
});
