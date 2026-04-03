import { router } from 'expo-router';

import { AuthSuccessState } from '@/components/auth/auth-success-state';
import { useI18n } from '@/i18n/provider';
import { useSession } from '@/providers/session-provider';

export default function AccountCreatedScreen() {
  const { t } = useI18n();
  const { isAuthenticated } = useSession();

  return (
    <AuthSuccessState
      title={t('auth.success.accountCreated.title')}
      description={t('auth.success.accountCreated.description')}
      buttonLabel={t('auth.success.accountCreated.button')}
      onPress={() => router.replace(isAuthenticated ? '/(tabs)' : '/(auth)/login')}
    />
  );
}
