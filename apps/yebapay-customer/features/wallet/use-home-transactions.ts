import { useWalletTransactions } from '@/features/wallet/use-wallet-transactions';

export function useHomeTransactions() {
  return useWalletTransactions(10);
}
