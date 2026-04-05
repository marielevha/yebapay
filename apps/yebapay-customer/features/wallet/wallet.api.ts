import { httpClient } from '@/lib/api/http-client';

import type { TransactionDetails, TransactionSummary, TransactionType, WalletDetails } from '@/features/wallet/wallet.types';

export const walletApi = {
  listCurrentUserWallets(accessToken: string) {
    return httpClient.request<WalletDetails[]>('/wallets/me', {
      method: 'GET',
      accessToken,
    });
  },

  listCurrentUserHomeTransactions(
    accessToken: string,
    params: {
      walletId: string;
      size?: number;
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set('walletId', params.walletId);

    if (typeof params.size === 'number') {
      searchParams.set('size', String(params.size));
    }

    return httpClient.request<TransactionSummary[]>(`/wallets/me/home-transactions?${searchParams.toString()}`, {
      method: 'GET',
      accessToken,
    });
  },

  listCurrentUserTransactions(
    accessToken: string,
    params?: {
      page?: number;
      size?: number;
      walletId?: string;
      transactionType?: TransactionType;
    }
  ) {
    const searchParams = new URLSearchParams();

    if (typeof params?.page === 'number') {
      searchParams.set('page', String(params.page));
    }

    if (typeof params?.size === 'number') {
      searchParams.set('size', String(params.size));
    }

    if (params?.walletId) {
      searchParams.set('walletId', params.walletId);
    }

    if (params?.transactionType) {
      searchParams.set('transactionType', params.transactionType);
    }

    const query = searchParams.toString();

    return httpClient.request<TransactionSummary[]>(`/wallets/me/transactions${query ? `?${query}` : ''}`, {
      method: 'GET',
      accessToken,
    });
  },

  getCurrentUserTransactionDetails(accessToken: string, transactionId: string) {
    return httpClient.request<TransactionDetails>(`/wallets/me/transactions/${transactionId}`, {
      method: 'GET',
      accessToken,
    });
  },
};
