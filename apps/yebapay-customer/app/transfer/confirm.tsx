import { Redirect, router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { useTransferFlow } from '@/features/transfer/transfer-flow-provider';
import { useI18n } from '@/i18n/provider';

function formatMoney(value: number, currencyDisplayCode: string, language: string) {
  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ${currencyDisplayCode}`;
}

function getInitials(displayName: string) {
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'Y';
}

function SummaryRow({
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
    <View style={[styles.summaryRow, isLast ? styles.summaryRowLast : undefined]}>
      <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
        {label}
      </ThemedText>
      <ThemedText
        type={strong ? 'defaultSemiBold' : 'default'}
        style={styles.summaryValue}
        numberOfLines={2}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function TransferConfirmScreen() {
  const { t, language } = useI18n();
  const { quote } = useTransferFlow();

  if (!quote) {
    return <Redirect href="/transfer/amount" />;
  }

  return (
    <TransferScreenShell
      stepLabel={t('transfer.steps.confirm')}
      title={t('transfer.confirm.title')}
      subtitle={t('transfer.confirm.subtitle')}
      onBack={() => router.back()}
      contentSurface="plain"
      footer={
        <AuthPrimaryButton
          label={t('transfer.confirm.submit')}
          onPress={() => router.push('/transfer/pin')}
        />
      }>
      <View style={styles.layout}>
        <View style={styles.recipientBlock}>
          <View style={styles.avatar}>
            <ThemedText type="defaultSemiBold" lightColor={BrandColors.ink} darkColor={BrandColors.ink}>
              {getInitials(quote.payeeDisplayName)}
            </ThemedText>
          </View>

          <View style={styles.recipientCopy}>
            <ThemedText type="subtitle">{quote.payeeDisplayName}</ThemedText>
            <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
              {quote.destinationWalletNumber}
            </ThemedText>
          </View>
        </View>

        {/* <View style={styles.amountBlock}>
          <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
            {t('transfer.summary.totalDebit')}
          </ThemedText>
          <ThemedText type="title" style={styles.amountValue}>
            {formatMoney(quote.totalDebit, quote.currencyDisplayCode, language)}
          </ThemedText>
        </View> */}

        <View style={styles.section}>
          <View style={styles.summaryList}>
            <SummaryRow label={t('transfer.summary.fromWallet')} value={quote.sourceWalletNumber} />
            <SummaryRow
              label={t('transfer.summary.amount')}
              value={formatMoney(quote.amount, quote.currencyDisplayCode, language)}
            />
            <SummaryRow
              label={t('transfer.summary.fees')}
              value={formatMoney(quote.feeAmount, quote.currencyDisplayCode, language)}
            />
            <SummaryRow
              label={t('transfer.summary.recipientGets')}
              value={formatMoney(quote.netAmount, quote.currencyDisplayCode, language)}
              strong
              isLast
            />
          </View>
        </View>

        {quote.description ? (
          <View style={styles.section}>
            <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
              {t('transfer.confirm.noteTitle')}
            </ThemedText>
            <ThemedText type="default" style={styles.noteText}>
              {quote.description}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </TransferScreenShell>
  );
}

const styles = StyleSheet.create({
  layout: {
    gap: 24,
  },
  recipientBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECE7',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(30, 107, 91, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(30, 107, 91, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientCopy: {
    flex: 1,
    gap: 2,
  },
  amountBlock: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E4ECE7',
  },
  amountValue: {
    textAlign: 'center',
    fontSize: 40,
    lineHeight: 46,
  },
  section: {
    gap: 12,
  },
  summaryList: {
    gap: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EEE9',
  },
  summaryRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  summaryValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  noteText: {
    lineHeight: 22,
  },
});
