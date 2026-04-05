import { ApiError, isApiError } from '@/lib/api/api-error';

type Translate = (key: string) => string;

function normalizeMessage(message: string | undefined) {
  return message?.trim().toLowerCase() ?? '';
}

export function getBeneficiaryErrorMessage(error: unknown, t: Translate) {
  if (isApiError(error)) {
    if (error.kind === 'network') {
      return t('transfer.errors.network');
    }

    const message = normalizeMessage(error.message);

    if (error.status === 401) {
      return t('transfer.errors.sessionExpired');
    }

    if (error.status === 429) {
      return t('transfer.errors.tooManyAttempts');
    }

    if (error.status !== null && error.status >= 500) {
      return t('transfer.errors.server');
    }

    if (message.includes('recipient wallet not found') || message.includes('recipient account not found')) {
      return t('transfer.errors.recipientNotFound');
    }

    if (message.includes('your own account as beneficiary')) {
      return t('transfer.errors.selfTransfer');
    }

    if (message.includes('recipient account is not active') || message.includes('user account is not active')) {
      return t('transfer.errors.accountUnavailable');
    }

    return t('transfer.beneficiaryNew.errors.saveFailed');
  }

  if (error instanceof ApiError || error instanceof Error) {
    return t('transfer.beneficiaryNew.errors.saveFailed');
  }

  return t('transfer.beneficiaryNew.errors.saveFailed');
}
