import { httpClient } from '@/lib/api/http-client';

import type { DecodeQrRequest, DecodedQrResponse, QrToken } from '@/features/qr/qr.types';

export const qrApi = {
  decode(payload: DecodeQrRequest, accessToken?: string) {
    return httpClient.request<DecodedQrResponse>('/qr/decode', {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },

  getPersonal(accessToken: string) {
    return httpClient.request<QrToken>('/qr/me/personal', {
      method: 'GET',
      accessToken,
    });
  },
};
