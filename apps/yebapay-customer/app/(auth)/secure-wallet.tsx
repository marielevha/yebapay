import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthField } from '@/components/auth/auth-field';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { sanitizePin } from '@/features/auth/auth-input';
import { useI18n } from '@/i18n/provider';
import { useSession } from '@/providers/session-provider';

export default function SecureWalletScreen() {
  const { t } = useI18n();
  const { isAuthenticated, setupTransactionPin } = useSession();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedPin = useMemo(() => sanitizePin(pin).slice(0, 6), [pin]);
  const normalizedConfirmPin = useMemo(() => sanitizePin(confirmPin).slice(0, 6), [confirmPin]);
  const canSubmit = normalizedPin.length >= 4 && normalizedConfirmPin.length >= 4;

  if (!isAuthenticated && !submitting) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    if (normalizedPin !== normalizedConfirmPin) {
      setErrorMessage(t('auth.errors.pinMismatch'));
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await setupTransactionPin({ pin: normalizedPin });
      router.push('/(auth)/account-created');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, { context: 'secureWallet', t }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title={t('auth.secureWallet.title')}
      footerPrompt={t('auth.secureWallet.footerPrompt')}
      footerCtaLabel={t('auth.secureWallet.footerCta')}
      onFooterPress={() => router.push('/(auth)/account-created')}>
      
      <AuthField
        label={t('auth.fields.transactionPin')}
        icon="pin"
        placeholder={t('auth.fields.transactionPinPlaceholder')}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        secureTextEntry
        maxLength={6}
        value={pin}
        onChangeText={(value) => {
          setPin(sanitizePin(value).slice(0, 6));
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      <AuthField
        label={t('auth.fields.confirmTransactionPin')}
        icon="lock-outline"
        placeholder={t('auth.fields.confirmTransactionPinPlaceholder')}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        secureTextEntry
        maxLength={6}
        value={confirmPin}
        onChangeText={(value) => {
          setConfirmPin(sanitizePin(value).slice(0, 6));
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}

      <AuthPrimaryButton
        label={t('auth.secureWallet.submit')}
        loadingLabel={t('auth.status.savingPin')}
        loading={submitting}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />

      <Pressable onPress={() => router.push('/(auth)/account-created')} hitSlop={8}>
        <ThemedText type="link" style={styles.skipLink} lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
          {t('auth.secureWallet.skip')}
        </ThemedText>
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  skipLink: {
    textAlign: 'center',
  },
});
