import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { moneyRequestApi } from '@/features/money-request/money-request.api';
import { getMoneyRequestErrorMessage } from '@/features/money-request/money-request-errors';
import type { MoneyRequestDetails } from '@/features/money-request/money-request.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type UseMoneyRequestDetailsResult = {
  moneyRequest: MoneyRequestDetails | null;
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
};

export function useMoneyRequestDetails(requestRef?: string): UseMoneyRequestDetailsResult {
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const isFocused = useIsFocused();
  const { t } = useI18n();
  const [moneyRequest, setMoneyRequest] = useState<MoneyRequestDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMoneyRequest = useCallback(async () => {
    if (!requestRef || !isAuthenticated || !accessToken) {
      setMoneyRequest(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestDetails = async (token: string) => moneyRequestApi.getMoneyRequestDetails(token, requestRef);

    try {
      const response = await requestDetails(accessToken);
      setMoneyRequest(response);
    } catch (error) {
      const shouldRetryWithRefresh = isApiError(error) && error.status === 401;

      if (shouldRetryWithRefresh) {
        try {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const response = await requestDetails(refreshed.accessToken);
            setMoneyRequest(response);
            setErrorMessage(null);
            return;
          }
        } catch {
          // Fall through to the user-facing error below.
        }
      }

      setMoneyRequest(null);
      setErrorMessage(getMoneyRequestErrorMessage(error, { context: 'details', t }));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated, refreshSession, requestRef, t]);

  const loadMoneyRequestRef = useRef(loadMoneyRequest);

  useEffect(() => {
    loadMoneyRequestRef.current = loadMoneyRequest;
  }, [loadMoneyRequest]);

  useEffect(() => {
    if (isFocused) {
      void loadMoneyRequestRef.current();
    }
  }, [isFocused, requestRef]);

  return useMemo(
    () => ({
      moneyRequest,
      isLoading,
      errorMessage,
      reload: loadMoneyRequest,
    }),
    [errorMessage, isLoading, loadMoneyRequest, moneyRequest]
  );
}
