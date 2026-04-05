import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { walletApi } from '@/features/wallet/wallet.api';
import { getWalletErrorMessage } from '@/features/wallet/wallet-errors';
import type { TransactionSummary } from '@/features/wallet/wallet.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type UseHomeTransactionsResult = {
  transactions: TransactionSummary[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export function useHomeTransactions(walletId?: string): UseHomeTransactionsResult {
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const isFocused = useIsFocused();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    if (!walletId || !isAuthenticated || !accessToken) {
      setTransactions([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestList = async (token: string) =>
      walletApi.listCurrentUserHomeTransactions(token, {
        walletId,
        size: 10,
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
  }, [accessToken, isAuthenticated, refreshSession, t, walletId]);

  const loadTransactionsRef = useRef(loadTransactions);

  useEffect(() => {
    loadTransactionsRef.current = loadTransactions;
  }, [loadTransactions]);

  useEffect(() => {
    if (isFocused) {
      void loadTransactionsRef.current();
    }
  }, [isFocused, walletId]);

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
