import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { walletApi } from '@/features/wallet/wallet.api';
import { getWalletErrorMessage } from '@/features/wallet/wallet-errors';
import type { TransactionSummary, TransactionType } from '@/features/wallet/wallet.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type UseInfiniteWalletTransactionsResult = {
  transactions: TransactionSummary[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
  loadNextPage: () => Promise<void>;
};

function appendUniqueTransactions(
  existingTransactions: TransactionSummary[],
  nextTransactions: TransactionSummary[]
) {
  const existingIds = new Set(existingTransactions.map((transaction) => transaction.id));

  return [
    ...existingTransactions,
    ...nextTransactions.filter((transaction) => !existingIds.has(transaction.id)),
  ];
}

export function useInfiniteWalletTransactions(
  pageSize = 10,
  filters?: {
    walletId?: string;
    transactionType?: TransactionType;
  }
): UseInfiniteWalletTransactionsResult {
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const isFocused = useIsFocused();
  const { t } = useI18n();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestInFlightRef = useRef(false);

  const fetchPage = useCallback(
    async (pageIndex: number, mode: 'replace' | 'append') => {
      if (requestInFlightRef.current) {
        return;
      }

      if (!isAuthenticated || !accessToken) {
        setTransactions([]);
        setPage(0);
        setHasMore(false);
        setErrorMessage(null);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      requestInFlightRef.current = true;

      if (mode === 'replace') {
        setIsLoading(true);
        setIsLoadingMore(false);
      } else {
        setIsLoadingMore(true);
      }

      setErrorMessage(null);

      const requestList = async (token: string) =>
        walletApi.listCurrentUserTransactions(token, {
          page: pageIndex,
          size: pageSize,
          walletId: filters?.walletId,
          transactionType: filters?.transactionType,
        });

      const applyResponse = (response: TransactionSummary[]) => {
        setTransactions((currentTransactions) =>
          mode === 'replace'
            ? response
            : appendUniqueTransactions(currentTransactions, response)
        );
        setPage(pageIndex);
        setHasMore(response.length === pageSize);
        setErrorMessage(null);
      };

      try {
        const response = await requestList(accessToken);
        applyResponse(response);
      } catch (error) {
        const shouldRetryWithRefresh = isApiError(error) && error.status === 401;

        if (shouldRetryWithRefresh) {
          try {
            const refreshed = await refreshSession();

            if (refreshed?.accessToken) {
              const response = await requestList(refreshed.accessToken);
              applyResponse(response);
              return;
            }
          } catch {
            // Fall through to the user-facing error below.
          }
        }

        if (mode === 'replace') {
          setTransactions([]);
          setHasMore(false);
          setPage(0);
        }

        setErrorMessage(
          getWalletErrorMessage(error, {
            genericMessage: t('transactionsPage.messages.genericError'),
            networkMessage: t('transactionsPage.messages.networkError'),
          })
        );
      } finally {
        requestInFlightRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      accessToken,
      filters?.transactionType,
      filters?.walletId,
      isAuthenticated,
      pageSize,
      refreshSession,
      t,
    ]
  );

  useEffect(() => {
    if (isFocused) {
      void fetchPage(0, 'replace');
    }
  }, [fetchPage, isFocused]);

  const reload = useCallback(async () => {
    await fetchPage(0, 'replace');
  }, [fetchPage]);

  const loadNextPage = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    await fetchPage(page + 1, 'append');
  }, [fetchPage, hasMore, isLoading, isLoadingMore, page]);

  return useMemo(
    () => ({
      transactions,
      isLoading,
      isLoadingMore,
      hasMore,
      errorMessage,
      reload,
      loadNextPage,
    }),
    [errorMessage, hasMore, isLoading, isLoadingMore, loadNextPage, reload, transactions]
  );
}
