export type P2pTransferQuoteRequest = {
  destinationWalletNumber: string;
  amount: number;
  description?: string;
};

export type P2pTransferQuoteResponse = {
  sourceWalletNumber: string;
  destinationWalletNumber: string;
  payerDisplayName: string;
  payeeDisplayName: string;
  amount: number;
  feeAmount: number;
  totalDebit: number;
  netAmount: number;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  description: string | null;
};

export type P2pTransferRequest = P2pTransferQuoteRequest & {
  pin: string;
  idempotencyKey: string;
};

export type P2pTransferResponse = {
  transactionId: string;
  transactionRef: string;
  status: string;
  sourceWalletNumber: string;
  destinationWalletNumber: string;
  payerDisplayName: string;
  payeeDisplayName: string;
  amount: number;
  feeAmount: number;
  totalDebit: number;
  netAmount: number;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  description: string | null;
  initiatedAt: string;
  completedAt: string | null;
};

export type TransferDraft = {
  beneficiaryDisplayName: string;
  destinationWalletNumber: string;
  amountInput: string;
  description: string;
  quote: P2pTransferQuoteResponse | null;
  result: P2pTransferResponse | null;
};
