import { router } from 'expo-router';
import { useState } from 'react';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthField } from '@/components/auth/auth-field';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { authApi } from '@/features/auth/auth.api';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { sanitizePhoneNumber } from '@/features/auth/auth-input';
import { useI18n } from '@/i18n/provider';

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const canSubmit = phoneNumber.trim().length >= 9;
  const { t } = useI18n();

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const normalizedPhoneNumber = sanitizePhoneNumber(phoneNumber);
      await authApi.requestPasswordReset({
        phoneNumber: normalizedPhoneNumber,
      });
      router.push({
        pathname: '/(auth)/verify-otp',
        params: {
          phoneNumber: normalizedPhoneNumber,
        },
      });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, { context: 'forgotPassword', t }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title={t('auth.forgotPassword.title')}
      footerPrompt={t('auth.forgotPassword.footerPrompt')}
      footerCtaLabel={t('auth.forgotPassword.footerCta')}
      onFooterPress={() => router.replace('/(auth)/login')}>
      <AuthField
        label={t('auth.fields.phoneNumber')}
        icon="phone-iphone"
        placeholder={t('auth.fields.phoneNumberPlaceholder')}
        keyboardType="phone-pad"
        textContentType="telephoneNumber"
        autoComplete="tel"
        value={phoneNumber}
        onChangeText={(value) => {
          setPhoneNumber(sanitizePhoneNumber(value));
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}

      <AuthPrimaryButton
        label={t('auth.forgotPassword.submit')}
        loadingLabel={t('auth.status.requestingCode')}
        loading={submitting}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </AuthScreenShell>
  );
}
