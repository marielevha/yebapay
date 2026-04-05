import { httpClient } from '@/lib/api/http-client';

import type { DecodeQrRequest, DecodedQrResponse } from '@/features/qr/qr.types';

export const qrApi = {
  decode(payload: DecodeQrRequest, accessToken?: string) {
    return httpClient.request<DecodedQrResponse>('/qr/decode', {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },
};
