import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { AuthField } from '@/components/auth/auth-field';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { BrandColors } from '@/constants/brand';
import { getBeneficiaryErrorMessage } from '@/features/beneficiaries/beneficiary-errors';
import { useBeneficiaries } from '@/features/beneficiaries/use-beneficiaries';
import { sanitizeTransferWalletNumber } from '@/features/transfer/transfer-input';
import { useTransferFlow } from '@/features/transfer/transfer-flow-provider';
import { useI18n } from '@/i18n/provider';

export default function TransferNewBeneficiaryScreen() {
  const { t } = useI18n();
  const params = useLocalSearchParams<{
    scannedWalletNumber?: string | string[];
    scannedDisplayName?: string | string[];
  }>();
  const { saveBeneficiary } = useBeneficiaries(undefined, { autoLoad: false });
  const { setDestinationWalletNumber } = useTransferFlow();
  const [displayName, setDisplayName] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedWalletNumber = useMemo(() => sanitizeTransferWalletNumber(walletNumber), [walletNumber]);
  const normalizedDisplayName = useMemo(() => displayName.replace(/\s+/g, ' ').trim(), [displayName]);
  const canSubmit = normalizedDisplayName.length >= 2 && normalizedWalletNumber.length >= 6;

  useEffect(() => {
    const scannedWallet = Array.isArray(params.scannedWalletNumber)
      ? params.scannedWalletNumber[0]
      : params.scannedWalletNumber;
    const scannedDisplayName = Array.isArray(params.scannedDisplayName)
      ? params.scannedDisplayName[0]
      : params.scannedDisplayName;

    if (scannedWallet) {
      setWalletNumber(sanitizeTransferWalletNumber(scannedWallet));
    }

    if (scannedDisplayName && !displayName.trim()) {
      setDisplayName(scannedDisplayName);
    }
  }, [displayName, params.scannedDisplayName, params.scannedWalletNumber]);

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const beneficiary = await saveBeneficiary({
        displayName: normalizedDisplayName,
        walletNumber: normalizedWalletNumber,
      });

      setDestinationWalletNumber(beneficiary.walletNumber, beneficiary.displayName);
      router.replace('/transfer/amount');
    } catch (error) {
      setErrorMessage(getBeneficiaryErrorMessage(error, t));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TransferScreenShell
      stepLabel={t('transfer.steps.recipient')}
      title={t('transfer.beneficiaryNew.title')}
      subtitle={t('transfer.beneficiaryNew.subtitle')}
      onBack={() => router.back()}
      footer={
        <AuthPrimaryButton
          label={t('transfer.beneficiaryNew.submit')}
          loading={submitting}
          loadingLabel={t('transfer.beneficiaryNew.saving')}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      }>
      <AuthField
        label={t('transfer.beneficiaryNew.fields.displayName')}
        icon="person-outline"
        placeholder={t('transfer.beneficiaryNew.fields.displayNamePlaceholder')}
        value={displayName}
        onChangeText={(value) => {
          setDisplayName(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      <AuthField
        label={t('transfer.beneficiaryNew.fields.walletNumber')}
        icon="account-balance-wallet"
        actionIcon="qr-code-scanner"
        actionColor={BrandColors.palm}
        onActionPress={() => router.push('/transfer/beneficiary-scan')}
        actionAccessibilityLabel={t('transfer.beneficiaryNew.scan.action')}
        placeholder={t('transfer.beneficiaryNew.fields.walletNumberPlaceholder')}
        autoCapitalize="characters"
        autoCorrect={false}
        value={walletNumber}
        onChangeText={(value) => {
          setWalletNumber(sanitizeTransferWalletNumber(value));
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}
    </TransferScreenShell>
  );
}
