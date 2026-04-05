import { httpClient } from '@/lib/api/http-client';

import type {
  AcceptMoneyRequestRequest,
  CreateMoneyRequestRequest,
  MoneyRequest,
  MoneyRequestDetails,
  MoneyRequestPaymentResponse,
  MoneyRequestQuoteRequest,
  MoneyRequestQuoteResponse,
} from '@/features/money-request/money-request.types';

export const moneyRequestApi = {
  createCurrentUserMoneyRequest(payload: CreateMoneyRequestRequest, accessToken: string) {
    return httpClient.request<MoneyRequest>('/money-requests', {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },

  listCurrentUserMoneyRequests(accessToken: string) {
    return httpClient.request<MoneyRequest[]>('/money-requests/me', {
      method: 'GET',
      accessToken,
    });
  },

  getMoneyRequestDetails(accessToken: string, requestRef: string) {
    return httpClient.request<MoneyRequestDetails>(`/money-requests/${requestRef}`, {
      method: 'GET',
      accessToken,
    });
  },

  quoteMoneyRequest(accessToken: string, requestRef: string, payload: MoneyRequestQuoteRequest = {}) {
    return httpClient.request<MoneyRequestQuoteResponse>(`/money-requests/${requestRef}/quote`, {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },

  acceptMoneyRequest(accessToken: string, requestRef: string, payload: AcceptMoneyRequestRequest) {
    return httpClient.request<MoneyRequestPaymentResponse>(`/money-requests/${requestRef}/accept`, {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },

  declineMoneyRequest(accessToken: string, requestRef: string) {
    return httpClient.request<MoneyRequest>(`/money-requests/${requestRef}/decline`, {
      method: 'POST',
      accessToken,
    });
  },

  cancelMoneyRequest(accessToken: string, requestRef: string) {
    return httpClient.request<MoneyRequest>(`/money-requests/${requestRef}/cancel`, {
      method: 'POST',
      accessToken,
    });
  },
};
