import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { getTransactionTypeLabel } from '@/features/wallet/transaction-presenter';
import type { TransactionSummary, TransactionType } from '@/features/wallet/wallet.types';

type Translate = (key: string, values?: Record<string, string | number>) => string;

export type PresentedTransactionHistoryItem = {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  kind: 'credit' | 'debit';
  metaIcon: ComponentProps<typeof MaterialIcons>['name'];
  avatarMode: 'initial' | 'icon';
  avatarInitial?: string;
  avatarIcon?: ComponentProps<typeof MaterialIcons>['name'];
  occurredAt: string;
};

export type PresentedTransactionHistorySection = {
  key: string;
  title: string;
  data: PresentedTransactionHistoryItem[];
};

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

  return getTransactionTypeLabel(transaction.transactionType, t as (key: string) => string);
}

function getTransactionSubtitle(transaction: TransactionSummary, t: Translate) {
  if (transaction.direction === 'IN') {
    return t('transactionsPage.list.received');
  }

  switch (transaction.transactionType) {
    case 'MERCHANT_PAYMENT':
    case 'CASH_OUT':
      return t('transactionsPage.list.paid');
    case 'P2P_TRANSFER':
    case 'MONEY_REQUEST':
    case 'ADMIN_ADJUSTMENT':
    case 'REFUND':
    case 'CASH_IN':
    default:
      return t('transactionsPage.list.sent');
  }
}

function getAvatarModel(transaction: TransactionSummary, title: string): Pick<
  PresentedTransactionHistoryItem,
  'avatarMode' | 'avatarInitial' | 'avatarIcon'
> {
  if (transaction.counterpartyDisplayName?.trim()) {
    return {
      avatarMode: 'initial',
      avatarInitial: title.charAt(0).toUpperCase(),
    };
  }

  return {
    avatarMode: 'icon',
    avatarIcon: getTransactionIcon(transaction),
  };
}

function formatAmount(transaction: TransactionSummary, language: string) {
  const locale = language === 'en' ? 'en-US' : 'fr-FR';
  const absoluteAmount = Math.abs(transaction.netAmount ?? transaction.amount ?? 0);
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(absoluteAmount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(absoluteAmount) ? 0 : 2,
  });
  const sign = transaction.direction === 'OUT' ? '-' : '+';

  return `${sign}${formatter.format(absoluteAmount)} ${transaction.currencyDisplayCode}`;
}

function getSectionKey(isoDate: string) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getSectionTitle(isoDate: string, language: string, t: Translate) {
  const date = new Date(isoDate);
  const now = new Date();

  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffInDays = Math.round((startOfToday - startOfDate) / 86400000);

  if (diffInDays === 0) {
    return t('transactionsPage.list.today');
  }

  if (diffInDays === 1) {
    return t('transactionsPage.list.yesterday');
  }

  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(date);
}

export function presentTransactionHistorySections(
  transactions: TransactionSummary[],
  t: Translate,
  language: string
): PresentedTransactionHistorySection[] {
  const sections = new Map<string, PresentedTransactionHistorySection>();

  transactions.forEach((transaction) => {
    const occurredAt = transaction.completedAt ?? transaction.initiatedAt;
    const sectionKey = getSectionKey(occurredAt);
    const title = getTransactionTitle(transaction, t);

    const item: PresentedTransactionHistoryItem = {
      id: transaction.id,
      title,
      subtitle: getTransactionSubtitle(transaction, t),
      amount: formatAmount(transaction, language),
      kind: transaction.direction === 'OUT' ? 'debit' : 'credit',
      metaIcon: getTransactionIcon(transaction),
      occurredAt,
      ...getAvatarModel(transaction, title),
    };

    if (!sections.has(sectionKey)) {
      sections.set(sectionKey, {
        key: sectionKey,
        title: getSectionTitle(occurredAt, language, t),
        data: [item],
      });
      return;
    }

    sections.get(sectionKey)?.data.push(item);
  });

  return Array.from(sections.values());
}

export function getTransactionTypeFilterOptions(
  transactionTypes: TransactionType[],
  t: Translate
) {
  return transactionTypes.map((transactionType) => ({
    value: transactionType,
    label: getTransactionTypeLabel(transactionType, t as (key: string) => string),
  }));
}
