import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import { walletApi } from '@/features/wallet/wallet.api';
import { getWalletErrorMessage } from '@/features/wallet/wallet-errors';
import type { WalletDetails } from '@/features/wallet/wallet.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type UseHomeWalletsResult = {
  wallets: WalletDetails[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export function useHomeWallets(): UseHomeWalletsResult {
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const { t } = useI18n();
  const [wallets, setWallets] = useState<WalletDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setWallets([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestList = async (token: string) => walletApi.listCurrentUserWallets(token);

    try {
      const response = await requestList(accessToken);
      setWallets(response);
    } catch (error) {
      const shouldRetryWithRefresh = isApiError(error) && error.status === 401;

      if (shouldRetryWithRefresh) {
        try {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const response = await requestList(refreshed.accessToken);
            setWallets(response);
            setErrorMessage(null);
            return;
          }
        } catch {
          // Fall through to the user-facing error below.
        }
      }

      setWallets([]);
      setErrorMessage(
        getWalletErrorMessage(error, {
          genericMessage: t('home.wallets.messages.genericError'),
          networkMessage: t('home.wallets.messages.networkError'),
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated, refreshSession, t]);

  useFocusEffect(
    useCallback(() => {
      void loadWallets();
    }, [loadWallets])
  );

  return useMemo(
    () => ({
      wallets,
      isLoading,
      errorMessage,
      reload: loadWallets,
    }),
    [errorMessage, isLoading, loadWallets, wallets]
  );
}
