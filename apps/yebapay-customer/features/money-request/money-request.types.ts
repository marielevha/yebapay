export type MoneyRequestStatus = 'PENDING' | 'DECLINED' | 'CANCELLED' | 'PAID' | 'EXPIRED';

export type MoneyRequestQr = {
  id: string;
  qrRef: string;
  qrType: string;
  status: string;
  signedPayload: string;
  walletNumber: string | null;
  amount: number | null;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  singleUse: boolean;
  expiresAt: string | null;
};

export type MoneyRequest = {
  id: string;
  requestRef: string;
  status: MoneyRequestStatus;
  requesterDisplayName: string;
  payerPhoneNumber: string | null;
  targetWalletNumber: string | null;
  amount: number | null;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  reason: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  qr: MoneyRequestQr | null;
};

export type MoneyRequestDetails = {
  id: string;
  requestRef: string;
  status: MoneyRequestStatus;
  requesterDisplayName: string;
  requesterPhoneNumber: string | null;
  payerDisplayName: string | null;
  payerPhoneNumber: string | null;
  targetWalletNumber: string | null;
  amount: number | null;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  reason: string | null;
  createdAt: string;
  expiresAt: string | null;
  paidAt: string | null;
  viewerIsRequester: boolean;
  payableByViewer: boolean;
  cancelableByViewer: boolean;
  declinableByViewer: boolean;
  qr: MoneyRequestQr | null;
};

export type CreateMoneyRequestRequest = {
  payerPhoneNumber?: string;
  targetWalletId?: string;
  amount: number;
  reason?: string;
  expiresInMinutes?: number;
};

export type MoneyRequestQuoteRequest = {
  amount?: number;
};

export type MoneyRequestQuoteResponse = {
  requestRef: string;
  requesterDisplayName: string;
  sourceWalletNumber: string;
  targetWalletNumber: string | null;
  amount: number;
  feeAmount: number;
  totalDebit: number;
  netAmount: number;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  reason: string | null;
  expiresAt: string | null;
};

export type AcceptMoneyRequestRequest = {
  amount?: number;
  idempotencyKey: string;
  pin: string;
  description?: string;
};

export type MoneyRequestPaymentResponse = {
  requestRef: string;
  status: string;
  transactionId: string;
  transactionRef: string;
  amount: number;
  feeAmount: number;
  totalDebit: number;
  netAmount: number;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  paidAt: string | null;
};
