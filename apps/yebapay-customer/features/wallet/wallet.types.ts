export type WalletType = 'PERSONAL' | 'MERCHANT' | 'AGENT' | 'SYSTEM';
export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'CLOSED';

export type WalletDetails = {
  id: string;
  walletNumber: string;
  walletType: WalletType;
  status: WalletStatus;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  availableBalance: number;
  pendingBalance: number;
  ledgerBalance: number;
  dailyLimit: number | null;
  monthlyLimit: number | null;
  lastActivityAt: string | null;
};

export type TransactionType =
  | 'P2P_TRANSFER'
  | 'MERCHANT_PAYMENT'
  | 'CASH_IN'
  | 'CASH_OUT'
  | 'MONEY_REQUEST'
  | 'REFUND'
  | 'ADMIN_ADJUSTMENT';

export const TRANSACTION_TYPES: TransactionType[] = [
  'P2P_TRANSFER',
  'MERCHANT_PAYMENT',
  'CASH_IN',
  'CASH_OUT',
  'MONEY_REQUEST',
  'REFUND',
  'ADMIN_ADJUSTMENT',
];

export type TransactionStatus =
  | 'INITIATED'
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUNDED';

export type TransactionDirection = 'IN' | 'OUT';

export type TransactionSummary = {
  id: string;
  transactionRef: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  direction: TransactionDirection;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
  sourceWalletNumber: string | null;
  destinationWalletNumber: string | null;
  counterpartyDisplayName: string | null;
  counterpartyPhoneNumber: string | null;
  description: string | null;
  initiatedAt: string;
  completedAt: string | null;
};

export type TransactionDetails = TransactionSummary & {
  totalDebit: number;
  payerDisplayName: string | null;
  payerPhoneNumber: string | null;
  payeeDisplayName: string | null;
  payeePhoneNumber: string | null;
  failureCode: string | null;
  failureMessage: string | null;
};
