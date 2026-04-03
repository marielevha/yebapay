import { router } from 'expo-router';

import { AuthSuccessState } from '@/components/auth/auth-success-state';
import { useI18n } from '@/i18n/provider';

export default function PasswordResetSuccessScreen() {
  const { t } = useI18n();

  return (
    <AuthSuccessState
      title={t('auth.success.passwordReset.title')}
      description={t('auth.success.passwordReset.description')}
      buttonLabel={t('auth.success.passwordReset.button')}
      onPress={() => router.replace('/(auth)/login')}
    />
  );
}
