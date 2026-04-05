import { httpClient } from '@/lib/api/http-client';

import type { Beneficiary } from '@/features/beneficiaries/beneficiary.types';

export const beneficiaryApi = {
  listCurrentUserBeneficiaries(
    accessToken: string,
    params?: {
      query?: string;
      limit?: number;
    }
  ) {
    const searchParams = new URLSearchParams();

    if (params?.query?.trim()) {
      searchParams.set('q', params.query.trim());
    }

    if (typeof params?.limit === 'number') {
      searchParams.set('limit', String(params.limit));
    }

    const query = searchParams.toString();

    return httpClient.request<Beneficiary[]>(`/beneficiaries/me${query ? `?${query}` : ''}`, {
      method: 'GET',
      accessToken,
    });
  },

  saveCurrentUserBeneficiary(
    payload: Pick<Beneficiary, 'displayName' | 'walletNumber'>,
    accessToken: string
  ) {
    return httpClient.request<Beneficiary>('/beneficiaries/me', {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },
};
