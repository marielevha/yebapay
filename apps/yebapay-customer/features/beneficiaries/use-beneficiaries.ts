import { useIsFocused } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { beneficiaryApi } from '@/features/beneficiaries/beneficiary.api';
import { getBeneficiaryErrorMessage } from '@/features/beneficiaries/beneficiary-errors';
import type { Beneficiary } from '@/features/beneficiaries/beneficiary.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type UseBeneficiariesResult = {
  beneficiaries: Beneficiary[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
  saveBeneficiary: (input: Pick<Beneficiary, 'displayName' | 'walletNumber'>) => Promise<Beneficiary>;
};

type UseBeneficiariesOptions = {
  autoLoad?: boolean;
};

export function useBeneficiaries(
  searchQuery?: string,
  options: UseBeneficiariesOptions = {}
): UseBeneficiariesResult {
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const { t } = useI18n();
  const isFocused = useIsFocused();
  const autoLoad = options.autoLoad ?? true;
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBeneficiaries = useCallback(async () => {
    if (!isAuthenticated || !accessToken) {
      setBeneficiaries([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const requestList = async (token: string) =>
      beneficiaryApi.listCurrentUserBeneficiaries(token, {
        query: searchQuery,
        limit: 50,
      });

    try {
      const nextBeneficiaries = await requestList(accessToken);
      setBeneficiaries(nextBeneficiaries);
    } catch (error) {
      const shouldRetryWithRefresh = isApiError(error) && error.status === 401;

      if (shouldRetryWithRefresh) {
        try {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const nextBeneficiaries = await requestList(refreshed.accessToken);
            setBeneficiaries(nextBeneficiaries);
            setErrorMessage(null);
            return;
          }
        } catch {
          // Fall through to the user-facing error below.
        }
      }

      setBeneficiaries([]);
      setErrorMessage(getBeneficiaryErrorMessage(error, t));
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, isAuthenticated, refreshSession, searchQuery, t]);

  const loadBeneficiariesRef = useRef(loadBeneficiaries);

  useEffect(() => {
    loadBeneficiariesRef.current = loadBeneficiaries;
  }, [loadBeneficiaries]);

  useEffect(() => {
    if (!autoLoad) {
      setIsLoading(false);
      return;
    }

    if (isFocused) {
      void loadBeneficiariesRef.current();
    }
  }, [autoLoad, isFocused]);

  const saveBeneficiary = useCallback(
    async (input: Pick<Beneficiary, 'displayName' | 'walletNumber'>) => {
      if (!accessToken) {
        throw new Error('No active session');
      }

      const requestSave = async (token: string) => beneficiaryApi.saveCurrentUserBeneficiary(input, token);

      try {
        const beneficiary = await requestSave(accessToken);
        if (autoLoad) {
          await loadBeneficiaries();
        }
        return beneficiary;
      } catch (error) {
        const shouldRetryWithRefresh = isApiError(error) && error.status === 401;

        if (shouldRetryWithRefresh) {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const beneficiary = await requestSave(refreshed.accessToken);
            if (autoLoad) {
              await loadBeneficiaries();
            }
            return beneficiary;
          }
        }

        throw error;
      }
    },
    [accessToken, autoLoad, loadBeneficiaries, refreshSession]
  );

  return useMemo(
    () => ({
      beneficiaries,
      isLoading,
      errorMessage,
      reload: loadBeneficiaries,
      saveBeneficiary,
    }),
    [beneficiaries, errorMessage, isLoading, loadBeneficiaries, saveBeneficiary]
  );
}
