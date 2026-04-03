import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthField } from '@/components/auth/auth-field';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { authApi } from '@/features/auth/auth.api';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { useI18n } from '@/i18n/provider';

function pickParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useI18n();
  const params = useLocalSearchParams<{ resetToken?: string | string[] }>();
  const resetToken = pickParam(params.resetToken);

  useEffect(() => {
    if (!resetToken) {
      router.replace('/(auth)/forgot-password');
    }
  }, [resetToken]);

  const canSubmit = useMemo(() => {
    return newPassword.trim().length >= 8 && newPassword === confirmPassword;
  }, [confirmPassword, newPassword]);

  const handleSubmit = async () => {
    if (!canSubmit || !resetToken || submitting) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await authApi.resetPassword({
        resetToken,
        newPassword: newPassword.trim(),
      });
      router.replace('/(auth)/password-reset-success');
    } catch (error) {
      setErrorMessage(
        getAuthErrorMessage(error, {
          genericMessage: t('auth.errors.generic'),
          networkMessage: t('auth.errors.network'),
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title={t('auth.resetPassword.title')}
      footerPrompt={t('auth.resetPassword.footerPrompt')}
      footerCtaLabel={t('auth.resetPassword.footerCta')}
      onFooterPress={() => router.replace('/(auth)/login')}>
      <AuthField
        label={t('auth.fields.newPassword')}
        icon="lock-outline"
        placeholder={t('auth.fields.newPasswordPlaceholder')}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password-new"
        value={newPassword}
        onChangeText={(value) => {
          setNewPassword(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      <AuthField
        label={t('auth.fields.confirmPassword')}
        icon="verified-user"
        placeholder={t('auth.fields.confirmPasswordPlaceholder')}
        secureTextEntry
        value={confirmPassword}
        onChangeText={(value) => {
          setConfirmPassword(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}

      <AuthPrimaryButton
        label={t('auth.resetPassword.submit')}
        loadingLabel={t('auth.status.savingPassword')}
        loading={submitting}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </AuthScreenShell>
  );
}
