import { ApiError, isApiError } from '@/lib/api/api-error';

type TransferErrorContext = 'quote' | 'submit';
type Translate = (key: string) => string;

function normalizeMessage(message: string | undefined) {
  return message?.trim().toLowerCase() ?? '';
}

function mapContextualTransferError(
  context: TransferErrorContext,
  status: number | null,
  message: string,
  t: Translate
) {
  if (status === 401) {
    return t('transfer.errors.sessionExpired');
  }

  if (status === 429) {
    return t('transfer.errors.tooManyAttempts');
  }

  if (status !== null && status >= 500) {
    return t('transfer.errors.server');
  }

  if (
    message.includes('recipient not found') ||
    message.includes('recipient wallet not found') ||
    message.includes('recipient account not found')
  ) {
    return t('transfer.errors.recipientNotFound');
  }

  if (message.includes('your own wallet')) {
    return t('transfer.errors.selfTransfer');
  }

  if (message.includes('amount is required') || message.includes('amount must be positive')) {
    return t('transfer.errors.invalidAmount');
  }

  if (message.includes('insufficient wallet balance')) {
    return t('transfer.errors.insufficientBalance');
  }

  if (message.includes('daily wallet limit exceeded')) {
    return t('transfer.errors.dailyLimitExceeded');
  }

  if (message.includes('monthly wallet limit exceeded')) {
    return t('transfer.errors.monthlyLimitExceeded');
  }

  if (message.includes('net amount must remain positive')) {
    return t('transfer.errors.invalidAmount');
  }

  if (
    message.includes('not active') ||
    message.includes('source wallet is not active') ||
    message.includes('destination wallet is not active')
  ) {
    return t('transfer.errors.accountUnavailable');
  }

  if (message.includes('cross-currency transfer')) {
    return t('transfer.errors.currencyUnsupported');
  }

  if (context === 'submit') {
    if (message.includes('transaction pin is not configured')) {
      return t('transfer.errors.pinNotConfigured');
    }

    if (message.includes('transaction pin is required')) {
      return t('transfer.errors.pinRequired');
    }

    if (status === 423 || message.includes('temporarily locked')) {
      return t('transfer.errors.pinLocked');
    }

    if (status === 403 || message.includes('invalid transaction pin')) {
      return t('transfer.errors.invalidPin');
    }
  }

  return null;
}

export function getTransferErrorMessage(
  error: unknown,
  {
    context,
    t,
  }: {
    context: TransferErrorContext;
    t: Translate;
  }
) {
  if (isApiError(error)) {
    if (error.kind === 'network') {
      return t('transfer.errors.network');
    }

    const message = normalizeMessage(error.message);
    const contextual = mapContextualTransferError(context, error.status, message, t);

    if (contextual) {
      return contextual;
    }

    return t('transfer.errors.generic');
  }

  if (error instanceof ApiError || error instanceof Error) {
    return t('transfer.errors.generic');
  }

  return t('transfer.errors.generic');
}
