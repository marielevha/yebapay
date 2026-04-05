import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { useTransferFlow } from '@/features/transfer/transfer-flow-provider';
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

export default function TransferSuccessScreen() {
  const { t, language } = useI18n();
  const { result, resetFlow } = useTransferFlow();

  if (!result) {
    return <Redirect href="/transfer/recipient" />;
  }

  return (
    <TransferScreenShell
      stepLabel={t('transfer.steps.success')}
      title={t('transfer.success.title')}
      subtitle={t('transfer.success.subtitle')}
      contentSurface="plain"
      onBack={() => {
        resetFlow();
        router.replace('/(tabs)');
      }}
      footer={
        <AuthPrimaryButton
          label={t('transfer.success.returnHome')}
          onPress={() => {
            resetFlow();
            router.replace('/(tabs)');
          }}
        />
      }>
      <View style={styles.successBadgeWrap}>
        <View style={[styles.successBadge, BrandShadow.card]}>
          <MaterialIcons name="check" size={34} color={BrandColors.white} />
        </View>
      </View>

      <View style={[styles.receiptCard, BrandShadow.card]}>
        <ThemedText type="sectionTitle">{t('transfer.success.receiptTitle')}</ThemedText>

        <View style={styles.receiptRows}>
          <ReceiptRow label={t('transfer.summary.reference')} value={result.transactionRef} strong />
          <ReceiptRow label={t('transfer.summary.recipient')} value={result.payeeDisplayName} />
          <ReceiptRow
            label={t('transfer.summary.totalDebit')}
            value={formatMoney(result.totalDebit, result.currencyDisplayCode, language)}
            strong
          />
          <ReceiptRow
            label={t('transfer.summary.date')}
            value={new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }).format(new Date(result.completedAt ?? result.initiatedAt))}
            isLast
          />
        </View>
      </View>

      <Pressable
        onPress={() => {
          resetFlow();
          router.replace('/(tabs)/transactions');
        }}
        hitSlop={8}>
        <ThemedText type="link" style={styles.secondaryLink} lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
          {t('transfer.success.viewTransactions')}
        </ThemedText>
      </Pressable>
    </TransferScreenShell>
  );
}

const styles = StyleSheet.create({
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
