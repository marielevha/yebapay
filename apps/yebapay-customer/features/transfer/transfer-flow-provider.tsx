import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

import { transferApi } from '@/features/transfer/transfer.api';
import { createTransferIdempotencyKey, parseTransferAmount } from '@/features/transfer/transfer-input';
import type { P2pTransferQuoteResponse, P2pTransferResponse, TransferDraft } from '@/features/transfer/transfer.types';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type TransferFlowContextValue = TransferDraft & {
  amountValue: number | null;
  setDestinationWalletNumber: (value: string, beneficiaryDisplayName?: string) => void;
  setAmountInput: (value: string) => void;
  setDescription: (value: string) => void;
  requestQuote: () => Promise<P2pTransferQuoteResponse>;
  submitTransfer: (pin: string) => Promise<P2pTransferResponse>;
  resetFlow: () => void;
};

const initialDraft: TransferDraft = {
  beneficiaryDisplayName: '',
  destinationWalletNumber: '',
  amountInput: '',
  description: '',
  quote: null,
  result: null,
};

const TransferFlowContext = createContext<TransferFlowContextValue | undefined>(undefined);

export function TransferFlowProvider({ children }: { children: ReactNode }) {
  const { accessToken, refreshSession } = useSession();
  const [draft, setDraft] = useState<TransferDraft>(initialDraft);
  const quoteVersionRef = useRef(0);

  const amountValue = useMemo(() => parseTransferAmount(draft.amountInput), [draft.amountInput]);

  const invalidateQuote = useCallback(() => {
    quoteVersionRef.current += 1;
  }, []);

  const updateDraft = useCallback((nextDraft: Partial<TransferDraft>) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...nextDraft,
    }));
  }, []);

  const setDestinationWalletNumber = useCallback(
    (value: string, beneficiaryDisplayName = '') => {
      invalidateQuote();
      updateDraft({
        beneficiaryDisplayName,
        destinationWalletNumber: value,
        quote: null,
        result: null,
      });
    },
    [invalidateQuote, updateDraft]
  );

  const setAmountInput = useCallback(
    (value: string) => {
      invalidateQuote();
      updateDraft({
        amountInput: value,
        quote: null,
        result: null,
      });
    },
    [invalidateQuote, updateDraft]
  );

  const setDescription = useCallback(
    (value: string) => {
      invalidateQuote();
      updateDraft({
        description: value,
        quote: null,
        result: null,
      });
    },
    [invalidateQuote, updateDraft]
  );

  const requestQuote = useCallback(async () => {
    if (!accessToken) {
      throw new Error('No active session');
    }

    if (!draft.destinationWalletNumber.trim() || amountValue === null) {
      throw new Error('Transfer draft is incomplete');
    }

    const payload = {
      destinationWalletNumber: draft.destinationWalletNumber.trim(),
      amount: amountValue,
      description: draft.description.trim() || undefined,
    };
    const quoteVersion = quoteVersionRef.current;

    const doRequest = async (token: string) => transferApi.quoteP2pTransfer(payload, token);
    const commitQuote = (response: P2pTransferQuoteResponse) => {
      if (quoteVersionRef.current === quoteVersion) {
        updateDraft({ quote: response, result: null });
      }
    };

    try {
      const response = await doRequest(accessToken);
      commitQuote(response);
      return response;
    } catch (error) {
      const shouldRetry = isApiError(error) && error.status === 401;

      if (shouldRetry) {
        const refreshed = await refreshSession();

        if (refreshed?.accessToken) {
          const response = await doRequest(refreshed.accessToken);
          commitQuote(response);
          return response;
        }
      }

      throw error;
    }
  }, [accessToken, amountValue, draft.description, draft.destinationWalletNumber, refreshSession, updateDraft]);

  const submitTransfer = useCallback(
    async (pin: string) => {
      if (!accessToken) {
        throw new Error('No active session');
      }

      if (!draft.destinationWalletNumber.trim() || amountValue === null) {
        throw new Error('Transfer draft is incomplete');
      }

      const payload = {
        destinationWalletNumber: draft.destinationWalletNumber.trim(),
        amount: amountValue,
        pin: pin.trim(),
        idempotencyKey: createTransferIdempotencyKey(),
        description: draft.description.trim() || undefined,
      };

      const doRequest = async (token: string) => transferApi.executeP2pTransfer(payload, token);

      try {
        const response = await doRequest(accessToken);
        updateDraft({ result: response });
        return response;
      } catch (error) {
        const shouldRetry = isApiError(error) && error.status === 401;

        if (shouldRetry) {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const response = await doRequest(refreshed.accessToken);
            updateDraft({ result: response });
            return response;
          }
        }

        throw error;
      }
    },
    [accessToken, amountValue, draft.description, draft.destinationWalletNumber, refreshSession, updateDraft]
  );

  const resetFlow = useCallback(() => {
    invalidateQuote();
    setDraft(initialDraft);
  }, [invalidateQuote]);

  const value = useMemo(
    () => ({
      ...draft,
      amountValue,
      setDestinationWalletNumber,
      setAmountInput,
      setDescription,
      requestQuote,
      submitTransfer,
      resetFlow,
    }),
    [amountValue, draft, requestQuote, resetFlow, setAmountInput, setDescription, setDestinationWalletNumber, submitTransfer]
  );

  return <TransferFlowContext.Provider value={value}>{children}</TransferFlowContext.Provider>;
}

export function useTransferFlow() {
  const context = useContext(TransferFlowContext);

  if (!context) {
    throw new Error('useTransferFlow must be used within TransferFlowProvider');
  }

  return context;
}
