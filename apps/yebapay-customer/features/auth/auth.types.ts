export type RoleCode = 'CUSTOMER' | 'MERCHANT' | 'AGENT' | 'ADMIN';
export type KycLevel = 'NONE' | 'BASIC' | 'STANDARD' | 'ADVANCED';
export type UserStatus =
  | 'PENDING_VERIFICATION'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'LOCKED'
  | 'DISABLED';
export type WalletType = 'PERSONAL' | 'MERCHANT' | 'AGENT' | 'SYSTEM';
export type WalletStatus = 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'CLOSED';

export type AuthUserWallet = {
  id: string;
  walletNumber: string;
  walletType: WalletType;
  status: WalletStatus;
  currencyCode: string;
  currencyDisplayCode: string;
  currencyDisplayName: string;
};

export type AuthUser = {
  id: string;
  publicId: string;
  phoneNumber: string;
  email: string | null;
  displayName: string;
  status: UserStatus;
  kycLevel: KycLevel;
  roles: RoleCode[];
  merchantProfileId: string | null;
  agentProfileId: string | null;
  wallets: AuthUserWallet[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
  refreshTokenExpiresInSeconds: number;
  user: AuthUser;
};

export type StoredAuthSession = AuthResponse & {
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};

export type LoginRequest = {
  phoneNumber: string;
  password: string;
};

export type RegisterRequest = {
  phoneNumber: string;
  password: string;
  pin?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

export type SetupTransactionPinRequest = {
  pin: string;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type AuthActionResponse = {
  message: string;
};

export type ForgotPasswordRequest = {
  phoneNumber: string;
};

export type VerifyPasswordResetOtpRequest = {
  phoneNumber: string;
  otpCode: string;
};

export type PasswordResetVerificationResponse = {
  resetToken: string;
  expiresInSeconds: number;
  message: string;
};

export type ResetPasswordRequest = {
  resetToken: string;
  newPassword: string;
};
