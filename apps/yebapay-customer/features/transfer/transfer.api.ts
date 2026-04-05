import { httpClient } from '@/lib/api/http-client';

import type {
  P2pTransferQuoteRequest,
  P2pTransferQuoteResponse,
  P2pTransferRequest,
  P2pTransferResponse,
} from '@/features/transfer/transfer.types';

export const transferApi = {
  quoteP2pTransfer(payload: P2pTransferQuoteRequest, accessToken: string) {
    return httpClient.request<P2pTransferQuoteResponse>('/transfers/p2p/quote', {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },

  executeP2pTransfer(payload: P2pTransferRequest, accessToken: string) {
    return httpClient.request<P2pTransferResponse>('/transfers/p2p', {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },
};
