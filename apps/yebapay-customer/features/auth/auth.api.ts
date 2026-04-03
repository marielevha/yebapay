import { httpClient } from '@/lib/api/http-client';
import type {
  AuthActionResponse,
  AuthResponse,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  PasswordResetVerificationResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SetupTransactionPinRequest,
  VerifyPasswordResetOtpRequest,
} from '@/features/auth/auth.types';

export const authApi = {
  register(payload: RegisterRequest) {
    return httpClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    });
  },

  login(payload: LoginRequest) {
    return httpClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    });
  },

  refresh(payload: RefreshTokenRequest) {
    return httpClient.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: payload,
    });
  },

  logout(payload: RefreshTokenRequest) {
    return httpClient.request<void>('/auth/logout', {
      method: 'POST',
      body: payload,
    });
  },

  setupTransactionPin(payload: SetupTransactionPinRequest, accessToken: string) {
    return httpClient.request<AuthActionResponse>('/auth/transaction-pin', {
      method: 'POST',
      body: payload,
      accessToken,
    });
  },

  me(accessToken: string) {
    return httpClient.request<AuthUser>('/auth/me', {
      method: 'GET',
      accessToken,
    });
  },

  requestPasswordReset(payload: ForgotPasswordRequest) {
    return httpClient.request<AuthActionResponse>('/auth/forgot-password/request-otp', {
      method: 'POST',
      body: payload,
    });
  },

  verifyPasswordResetOtp(payload: VerifyPasswordResetOtpRequest) {
    return httpClient.request<PasswordResetVerificationResponse>('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: payload,
    });
  },

  resetPassword(payload: ResetPasswordRequest) {
    return httpClient.request<AuthActionResponse>('/auth/forgot-password/reset', {
      method: 'POST',
      body: payload,
    });
  },
};
