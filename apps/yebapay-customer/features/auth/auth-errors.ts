import { ApiError, isApiError } from '@/lib/api/api-error';

type AuthErrorContext =
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'verifyOtp'
  | 'resetPassword'
  | 'secureWallet';

type Translate = (key: string) => string;

function normalizeMessage(message: string | undefined) {
  return message?.trim().toLowerCase() ?? '';
}

function mapContextualHttpError(context: AuthErrorContext, status: number | null, message: string, t: Translate) {
  if (status === 429) {
    return t('auth.errors.tooManyAttempts');
  }

  if (status !== null && status >= 500) {
    return t('auth.errors.server');
  }

  switch (context) {
    case 'login':
      if (status === 401) {
        if (message.includes('not active')) {
          return t('auth.errors.login.accountInactive');
        }

        return t('auth.errors.login.invalidCredentials');
      }

      if (status === 423 || message.includes('locked')) {
        return t('auth.errors.login.accountLocked');
      }

      break;

    case 'register':
      if (status === 409 && message.includes('phone')) {
        return t('auth.errors.register.phoneAlreadyRegistered');
      }

      if (status === 409 && message.includes('email')) {
        return t('auth.errors.register.emailAlreadyRegistered');
      }

      if (status === 400 || status === 422) {
        return t('auth.errors.register.invalidData');
      }

      break;

    case 'forgotPassword':
      if (status === 400 || status === 422) {
        return t('auth.errors.forgotPassword.invalidPhone');
      }

      break;

    case 'verifyOtp':
      if (status === 400 || message.includes('otp')) {
        return t('auth.errors.verifyOtp.invalidCode');
      }

      break;

    case 'resetPassword':
      if (status === 400 && (message.includes('token') || message.includes('expired') || message.includes('reset'))) {
        return t('auth.errors.resetPassword.invalidToken');
      }

      if (status === 400 || status === 422) {
        return t('auth.errors.resetPassword.invalidPassword');
      }

      break;

    case 'secureWallet':
      if (status === 401) {
        return t('auth.errors.sessionExpired');
      }

      if (status === 409 && message.includes('already')) {
        return t('auth.errors.secureWallet.pinAlreadyConfigured');
      }

      if (status === 400 || status === 422) {
        return t('auth.errors.secureWallet.invalidPin');
      }

      break;
  }

  return null;
}

export function getAuthErrorMessage(
  error: unknown,
  {
    context,
    t,
  }: {
    context: AuthErrorContext;
    t: Translate;
  }
) {
  if (isApiError(error)) {
    if (error.kind === 'network') {
      return t('auth.errors.network');
    }

    const message = normalizeMessage(error.message);
    const contextualMessage = mapContextualHttpError(context, error.status, message, t);

    if (contextualMessage) {
      return contextualMessage;
    }

    if (error.status === 401) {
      return context === 'login' ? t('auth.errors.login.invalidCredentials') : t('auth.errors.sessionExpired');
    }

    return t('auth.errors.generic');
  }

  if (error instanceof ApiError && error.message) {
    return t('auth.errors.generic');
  }

  if (error instanceof Error && error.message) {
    return t('auth.errors.generic');
  }

  return t('auth.errors.generic');
}
