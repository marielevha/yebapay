export type DecodeQrRequest = {
  qrData: string;
};

export type DecodedQrResponse = {
  qrRef: string;
  qrType: string;
  status: string;
  signedPayload: string;
  walletNumber: string | null;
  merchantCode: string | null;
  merchantDisplayName: string | null;
  beneficiaryDisplayName: string | null;
  moneyRequestRef: string | null;
  amount: number | null;
  currencyCode: string | null;
  currencyDisplayCode: string | null;
  currencyDisplayName: string | null;
  singleUse: boolean;
  expiresAt: string | null;
};
