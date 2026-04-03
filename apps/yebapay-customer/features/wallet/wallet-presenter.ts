import type { WalletDetails, WalletType } from '@/features/wallet/wallet.types';

type Translate = (key: string) => string;

export function getWalletTypeLabel(walletType: WalletType, t: Translate) {
  switch (walletType) {
    case 'MERCHANT':
      return t('home.wallets.types.merchant');
    case 'AGENT':
      return t('home.wallets.types.agent');
    case 'SYSTEM':
      return t('home.wallets.types.system');
    case 'PERSONAL':
    default:
      return t('home.wallets.types.personal');
  }
}

export function formatWalletBalance(wallet: WalletDetails, language: string) {
  const locale = language === 'en' ? 'en-US' : 'fr-FR';
  const amount = wallet.availableBalance ?? 0;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

  return `${formatter.format(amount)} ${wallet.currencyDisplayCode}`;
}

export function maskWalletNumber(walletNumber: string) {
  const compactValue = walletNumber.replace(/\s+/g, '');

  if (!compactValue) {
    return '••••';
  }

  if (compactValue.length <= 4) {
    return compactValue;
  }

  return `•••• ${compactValue.slice(-4)}`;
}
