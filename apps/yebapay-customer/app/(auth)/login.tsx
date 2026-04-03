import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthField } from '@/components/auth/auth-field';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { getLoginFormDefaults } from '@/features/auth/auth-dev-defaults';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { sanitizePhoneNumber } from '@/features/auth/auth-input';
import { useI18n } from '@/i18n/provider';
import { useOnboarding } from '@/providers/onboarding-provider';
import { useSession } from '@/providers/session-provider';

export default function LoginScreen() {
  const [defaults] = useState(getLoginFormDefaults);
  const [phoneNumber, setPhoneNumber] = useState(defaults.phoneNumber);
  const [password, setPassword] = useState(defaults.password);
  const { t } = useI18n();
  const { signIn } = useSession();
  const { hasSeenOnboarding, markOnboardingSeen } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedPhoneNumber = useMemo(() => sanitizePhoneNumber(phoneNumber), [phoneNumber]);
  const canSubmit = normalizedPhoneNumber.length >= 9 && password.trim().length >= 8;

  useEffect(() => {
    if (hasSeenOnboarding) {
      return;
    }

    void markOnboardingSeen();
  }, [hasSeenOnboarding, markOnboardingSeen]);

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await signIn({
        phoneNumber: normalizedPhoneNumber,
        password: password.trim(),
      });
      router.replace('/(tabs)');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error, { context: 'login', t }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthScreenShell
      title={t('auth.login.title')}
      footerPrompt={t('auth.login.footerPrompt')}
      footerCtaLabel={t('auth.login.footerCta')}
      onFooterPress={() => router.push('/(auth)/register')}>
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

      <AuthField
        label={t('auth.fields.password')}
        icon="lock-outline"
        placeholder={t('auth.fields.passwordPlaceholder')}
        textContentType="password"
        autoComplete="password"
        secureTextEntry
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      <Pressable onPress={() => router.push('/(auth)/forgot-password')} hitSlop={8} style={styles.forgotWrap}>
        <ThemedText type="link" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
          {t('auth.login.forgotPassword')}
        </ThemedText>
      </Pressable>

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}

      <AuthPrimaryButton
        label={t('auth.login.submit')}
        loadingLabel={t('auth.status.signingIn')}
        loading={submitting}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  forgotWrap: {
    alignItems: 'flex-end',
  },
});
