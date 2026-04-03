import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AuthCodeInput } from '@/components/auth/auth-code-input';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { authApi } from '@/features/auth/auth.api';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { sanitizeOtpCode, sanitizePhoneNumber } from '@/features/auth/auth-input';
import { useI18n } from '@/i18n/provider';

function pickParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function VerifyOtpScreen() {
  const [otpCode, setOtpCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const params = useLocalSearchParams<{ phoneNumber?: string | string[] }>();
  const phoneNumber = sanitizePhoneNumber(pickParam(params.phoneNumber));
  const canSubmit = otpCode.length === 6;
  const { t } = useI18n();

  useEffect(() => {
    if (!phoneNumber) {
      router.replace('/(auth)/forgot-password');
    }
  }, [phoneNumber]);

  const handleVerify = async () => {
    if (!canSubmit || !phoneNumber || submitting) {
      return;
    }

    setInfoMessage(null);
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const response = await authApi.verifyPasswordResetOtp({
        phoneNumber,
        otpCode,
      });

      router.push({
        pathname: '/(auth)/reset-password',
        params: {
          resetToken: response.resetToken,
          phoneNumber,
        },
      });
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, { context: 'verifyOtp', t }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!phoneNumber || resending) {
      return;
    }

    setErrorMessage(null);
    setInfoMessage(null);
    setResending(true);

    try {
      await authApi.requestPasswordReset({
        phoneNumber,
      });
      setInfoMessage(t('auth.messages.otpResent'));
      setOtpCode('');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, { context: 'forgotPassword', t }));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScreenShell
      title={t('auth.verifyOtp.title')}
      footerPrompt={t('auth.verifyOtp.footerPrompt')}
      footerCtaLabel={t('auth.verifyOtp.footerCta')}
      onFooterPress={handleResend}>
      <AuthCodeInput
        label={t('auth.fields.otpCode')}
        value={otpCode}
        onChangeText={(value) => {
          setOtpCode(sanitizeOtpCode(value));
          if (errorMessage) {
            setErrorMessage(null);
          }
          if (infoMessage) {
            setInfoMessage(null);
          }
        }}
      />

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}
      {infoMessage ? <AuthFormAlert message={infoMessage} tone="info" /> : null}

      <AuthPrimaryButton
        label={t('auth.verifyOtp.submit')}
        loadingLabel={t('auth.status.verifyingCode')}
        loading={submitting}
        disabled={!canSubmit}
        onPress={handleVerify}
      />

      <Pressable onPress={() => router.back()} hitSlop={8}>
        <ThemedText type="link" style={styles.backLink} lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
          {t('auth.verifyOtp.back')}
        </ThemedText>
      </Pressable>
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  backLink: {
    textAlign: 'center',
  },
});
