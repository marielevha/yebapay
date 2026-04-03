import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { TransactionSummary, TransactionType } from '@/features/wallet/wallet.types';

export type PresentedTransaction = {
  id: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  amount: string;
  time: string;
  kind: 'credit' | 'debit';
};

type Translate = (key: string) => string;

export function getTransactionTypeLabel(transactionType: TransactionType, t: Translate) {
  switch (transactionType) {
    case 'MERCHANT_PAYMENT':
      return t('home.transactions.types.merchantPayment');
    case 'CASH_IN':
      return t('home.transactions.types.cashIn');
    case 'CASH_OUT':
      return t('home.transactions.types.cashOut');
    case 'MONEY_REQUEST':
      return t('home.transactions.types.moneyRequest');
    case 'REFUND':
      return t('home.transactions.types.refund');
    case 'ADMIN_ADJUSTMENT':
      return t('home.transactions.types.adminAdjustment');
    case 'P2P_TRANSFER':
    default:
      return t('home.transactions.types.p2pTransferOut');
  }
}

function getTransactionIcon(transaction: TransactionSummary): ComponentProps<typeof MaterialIcons>['name'] {
  switch (transaction.transactionType) {
    case 'MERCHANT_PAYMENT':
      return 'storefront';
    case 'CASH_IN':
      return 'south-west';
    case 'CASH_OUT':
      return 'north-east';
    case 'MONEY_REQUEST':
      return 'request-page';
    case 'REFUND':
      return 'replay';
    case 'ADMIN_ADJUSTMENT':
      return 'tune';
    case 'P2P_TRANSFER':
    default:
      return transaction.direction === 'OUT' ? 'north-east' : 'south-west';
  }
}

function getTransactionTitle(transaction: TransactionSummary, t: Translate) {
  if (transaction.counterpartyDisplayName?.trim()) {
    return transaction.counterpartyDisplayName.trim();
  }

  switch (transaction.transactionType) {
    case 'MERCHANT_PAYMENT':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'CASH_IN':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'CASH_OUT':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'MONEY_REQUEST':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'REFUND':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'ADMIN_ADJUSTMENT':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'P2P_TRANSFER':
    default:
      return transaction.direction === 'OUT'
        ? t('home.transactions.types.p2pTransferOut')
        : t('home.transactions.types.p2pTransferIn');
  }
}

function getTransactionSubtitle(transaction: TransactionSummary, t: Translate) {
  if (transaction.description?.trim()) {
    return transaction.description.trim();
  }

  if (transaction.transactionType === 'P2P_TRANSFER') {
    return transaction.direction === 'OUT'
      ? t('home.transactions.types.p2pTransferOut')
      : t('home.transactions.types.p2pTransferIn');
  }

  switch (transaction.transactionType) {
    case 'MERCHANT_PAYMENT':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'CASH_IN':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'CASH_OUT':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'MONEY_REQUEST':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'REFUND':
      return getTransactionTypeLabel(transaction.transactionType, t);
    case 'ADMIN_ADJUSTMENT':
      return getTransactionTypeLabel(transaction.transactionType, t);
    default:
      return transaction.currencyDisplayCode;
  }
}

function formatTransactionAmount(transaction: TransactionSummary, language: string) {
  const locale = language === 'en' ? 'en-US' : 'fr-FR';
  const absoluteAmount = Math.abs(transaction.netAmount ?? transaction.amount ?? 0);
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(absoluteAmount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(absoluteAmount) ? 0 : 2,
  });
  const sign = transaction.direction === 'OUT' ? '-' : '+';

  return `${sign}${formatter.format(absoluteAmount)} ${transaction.currencyDisplayCode}`;
}

function formatTransactionTime(isoDate: string, language: string) {
  const locale = language === 'en' ? 'en-US' : 'fr-FR';
  const date = new Date(isoDate);
  const dateLabel = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${dateLabel} · ${timeLabel}`;
}

export function presentTransaction(transaction: TransactionSummary, t: Translate, language: string): PresentedTransaction {
  return {
    id: transaction.id,
    icon: getTransactionIcon(transaction),
    title: getTransactionTitle(transaction, t),
    subtitle: getTransactionSubtitle(transaction, t),
    amount: formatTransactionAmount(transaction, language),
    time: formatTransactionTime(transaction.completedAt ?? transaction.initiatedAt, language),
    kind: transaction.direction === 'OUT' ? 'debit' : 'credit',
  };
}
