export type Beneficiary = {
  id: string;
  displayName: string;
  walletNumber: string;
  beneficiaryUserId: string | null;
  beneficiaryUserDisplayName: string | null;
  lastUsedAt: string | null;
};
