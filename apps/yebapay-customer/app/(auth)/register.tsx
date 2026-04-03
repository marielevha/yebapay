import { router } from 'expo-router';
import { useMemo, useState } from 'react';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthField } from '@/components/auth/auth-field';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { AuthScreenShell } from '@/components/auth/auth-screen-shell';
import { getRegisterFormDefaults } from '@/features/auth/auth-dev-defaults';
import { getAuthErrorMessage } from '@/features/auth/auth-errors';
import { sanitizePhoneNumber } from '@/features/auth/auth-input';
import { useI18n } from '@/i18n/provider';
import { useSession } from '@/providers/session-provider';

export default function RegisterScreen() {
  const [defaults] = useState(getRegisterFormDefaults);
  const [firstName, setFirstName] = useState(defaults.firstName);
  const [lastName, setLastName] = useState(defaults.lastName);
  const [phoneNumber, setPhoneNumber] = useState(defaults.phoneNumber);
  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState(defaults.password);
  const { t } = useI18n();
  const { signUp } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedPhoneNumber = useMemo(() => sanitizePhoneNumber(phoneNumber), [phoneNumber]);

  const canSubmit =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    normalizedPhoneNumber.length >= 9 &&
    password.trim().length >= 8;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await signUp({
        phoneNumber: normalizedPhoneNumber,
        password: password.trim(),
        email: email.trim() || undefined,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      router.push('/(auth)/secure-wallet');
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
      title={t('auth.register.title')}
      footerPrompt={t('auth.register.footerPrompt')}
      footerCtaLabel={t('auth.register.footerCta')}
      onFooterPress={() => router.replace('/(auth)/login')}>
      <AuthField
        label={t('auth.fields.firstName')}
        icon="person-outline"
        placeholder={t('auth.fields.firstNamePlaceholder')}
        textContentType="givenName"
        autoComplete="name-given"
        value={firstName}
        onChangeText={(value) => {
          setFirstName(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      <AuthField
        label={t('auth.fields.lastName')}
        icon="badge"
        placeholder={t('auth.fields.lastNamePlaceholder')}
        textContentType="familyName"
        autoComplete="name-family"
        value={lastName}
        onChangeText={(value) => {
          setLastName(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

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
        label={t('auth.fields.email')}
        icon="mail-outline"
        placeholder={t('auth.fields.emailPlaceholder')}
        keyboardType="email-address"
        textContentType="emailAddress"
        autoComplete="email"
        value={email}
        onChangeText={(value) => {
          setEmail(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      <AuthField
        label={t('auth.fields.password')}
        icon="lock-outline"
        placeholder={t('auth.fields.passwordPlaceholder')}
        secureTextEntry
        textContentType="newPassword"
        autoComplete="password-new"
        value={password}
        onChangeText={(value) => {
          setPassword(value);
          if (errorMessage) {
            setErrorMessage(null);
          }
        }}
      />

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}

      <AuthPrimaryButton
        label={t('auth.register.submit')}
        loadingLabel={t('auth.status.creatingAccount')}
        loading={submitting}
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </AuthScreenShell>
  );
}
