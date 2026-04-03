import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';

import { walletApi } from '@/features/wallet/wallet.api';
import { getWalletErrorMessage } from '@/features/wallet/wallet-errors';
import type { TransactionSummary, TransactionType } from '@/features/wallet/wallet.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type UseWalletTransactionsResult = {
  transactions: TransactionSummary[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export function useWalletTransactions(
  limit?: number,
  filters?: {
    walletId?: string;
    transactionType?: TransactionType;
  }
): UseWalletTransactionsResult {
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setTransactions([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestList = async (token: string) =>
      walletApi.listCurrentUserTransactions(token, {
        page: 0,
        size: typeof limit === 'number' ? limit : 50,
        walletId: filters?.walletId,
        transactionType: filters?.transactionType,
      });

    try {
      const response = await requestList(accessToken);
      setTransactions(response);
    } catch (error) {
      const shouldRetryWithRefresh = isApiError(error) && error.status === 401;

      if (shouldRetryWithRefresh) {
        try {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const response = await requestList(refreshed.accessToken);
            setTransactions(response);
            setErrorMessage(null);
            return;
          }
        } catch {
          // Fall through to the user-facing error below.
        }
      }

      setTransactions([]);
      setErrorMessage(
        getWalletErrorMessage(error, {
          genericMessage: t('home.transactions.messages.genericError'),
          networkMessage: t('home.transactions.messages.networkError'),
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, filters?.transactionType, filters?.walletId, isAuthenticated, limit, refreshSession, t]);

  useFocusEffect(
    useCallback(() => {
      void loadTransactions();
    }, [loadTransactions])
  );

  return useMemo(
    () => ({
      transactions,
      isLoading,
      errorMessage,
      reload: loadTransactions,
    }),
    [errorMessage, isLoading, loadTransactions, transactions]
  );
}
