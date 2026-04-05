import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { walletApi } from '@/features/wallet/wallet.api';
import { getWalletErrorMessage } from '@/features/wallet/wallet-errors';
import type { TransactionDetails } from '@/features/wallet/wallet.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type UseTransactionDetailsResult = {
  transaction: TransactionDetails | null;
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export function useTransactionDetails(transactionId?: string): UseTransactionDetailsResult {
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const isFocused = useIsFocused();
  const { t } = useI18n();
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTransaction = useCallback(async () => {
    if (!transactionId || !isAuthenticated || !accessToken) {
      setTransaction(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestDetails = async (token: string) => walletApi.getCurrentUserTransactionDetails(token, transactionId);

    try {
      const response = await requestDetails(accessToken);
      setTransaction(response);
    } catch (error) {
      const shouldRetryWithRefresh = isApiError(error) && error.status === 401;

      if (shouldRetryWithRefresh) {
        try {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const response = await requestDetails(refreshed.accessToken);
            setTransaction(response);
            setErrorMessage(null);
            return;
          }
        } catch {
          // Fall through to the user-facing error below.
        }
      }

      setTransaction(null);
      setErrorMessage(
        getWalletErrorMessage(error, {
          genericMessage: t('transactionsPage.details.messages.genericError'),
          networkMessage: t('transactionsPage.details.messages.networkError'),
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated, refreshSession, t, transactionId]);

  const loadTransactionRef = useRef(loadTransaction);

  useEffect(() => {
    loadTransactionRef.current = loadTransaction;
  }, [loadTransaction]);

  useEffect(() => {
    if (isFocused) {
      void loadTransactionRef.current();
    }
  }, [isFocused, transactionId]);

  return useMemo(
    () => ({
      transaction,
      isLoading,
      errorMessage,
      reload: loadTransaction,
    }),
    [errorMessage, isLoading, loadTransaction, transaction]
  );
}
