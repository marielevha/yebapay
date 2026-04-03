import { httpClient } from '@/lib/api/http-client';

import type { TransactionSummary, TransactionType, WalletDetails } from '@/features/wallet/wallet.types';

export const walletApi = {
  listCurrentUserWallets(accessToken: string) {
    return httpClient.request<WalletDetails[]>('/wallets/me', {
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
};
