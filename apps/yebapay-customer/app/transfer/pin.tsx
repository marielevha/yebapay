import { Redirect, router } from 'expo-router';
import { useState } from 'react';

import { AuthField } from '@/components/auth/auth-field';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { TransferSummaryCard } from '@/components/transfer/transfer-summary-card';
import { getTransferErrorMessage } from '@/features/transfer/transfer-errors';
import { sanitizeTransferPin } from '@/features/transfer/transfer-input';
import { useTransferFlow } from '@/features/transfer/transfer-flow-provider';
import { useI18n } from '@/i18n/provider';

function formatMoney(value: number, currencyDisplayCode: string, language: string) {
  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ${currencyDisplayCode}`;
}

export default function TransferPinScreen() {
  const { t, language } = useI18n();
  const { quote, submitTransfer } = useTransferFlow();
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!quote) {
    return <Redirect href="/transfer/amount" />;
  }

  const canSubmit = pin.length >= 4;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await submitTransfer(pin);
      router.replace('/transfer/success');
    } catch (error) {
      setErrorMessage(getTransferErrorMessage(error, { context: 'submit', t }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TransferScreenShell
      stepLabel={t('transfer.steps.security')}
      title={t('transfer.pin.title')}
      subtitle={t('transfer.pin.subtitle')}
      onBack={() => router.back()}
      footer={
        <AuthPrimaryButton
          label={t('transfer.pin.submit')}
          loadingLabel={t('transfer.status.sending')}
          loading={submitting}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      }>
      <TransferSummaryCard
        title={t('transfer.pin.summaryTitle')}
        rows={[
          {
            label: t('transfer.summary.recipient'),
            value: quote.payeeDisplayName,
          },
          {
            label: t('transfer.summary.totalDebit'),
            value: formatMoney(quote.totalDebit, quote.currencyDisplayCode, language),
            strong: true,
          },
        ]}
      />

      <AuthField
        label={t('transfer.fields.pin')}
        icon="pin"
        placeholder={t('transfer.fields.pinPlaceholder')}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={(value) => {
          setPin(sanitizeTransferPin(value));
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}
    </TransferScreenShell>
  );
}
