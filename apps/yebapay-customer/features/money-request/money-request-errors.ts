import { ApiError, isApiError } from '@/lib/api/api-error';

type MoneyRequestErrorContext = 'create' | 'details' | 'quote' | 'pay' | 'cancel' | 'decline';
type Translate = (key: string) => string;

function normalizeMessage(message: string | undefined) {
  return message?.trim().toLowerCase() ?? '';
}

function mapContextualMoneyRequestError(
  context: MoneyRequestErrorContext,
  status: number | null,
  message: string,
  t: Translate
) {
  if (status === 401) {
    return t('requestMoney.errors.sessionExpired');
  }

  if (status === 429) {
    return t('requestMoney.errors.tooManyAttempts');
  }

  if (status !== null && status >= 500) {
    return t('requestMoney.errors.server');
  }

  if (message.includes('money request not found')) {
    return t('requestMoney.errors.notFound');
  }

  if (message.includes('has expired')) {
    return t('requestMoney.errors.expired');
  }

  if (message.includes('no longer pending')) {
    return t('requestMoney.errors.notPending');
  }

  if (message.includes('assigned to another user')) {
    return t('requestMoney.errors.assignedToAnotherUser');
  }

  if (message.includes('settle your own money request')) {
    return t('requestMoney.errors.selfRequest');
  }

  if (message.includes('amount is required') || message.includes('amount must be positive')) {
    return t('requestMoney.errors.invalidAmount');
  }

  if (message.includes('cross-currency transfer is not supported yet')) {
    return t('requestMoney.errors.currencyUnsupported');
  }

  if (message.includes('insufficient wallet balance')) {
    return t('requestMoney.errors.insufficientBalance');
  }

  if (message.includes('daily wallet limit exceeded')) {
    return t('requestMoney.errors.dailyLimitExceeded');
  }

  if (message.includes('monthly wallet limit exceeded')) {
    return t('requestMoney.errors.monthlyLimitExceeded');
  }

  if (
    message.includes('not active')
    || message.includes('wallet is not active')
    || message.includes('account is not active')
  ) {
    return t('requestMoney.errors.accountUnavailable');
  }

  if (context === 'pay') {
    if (message.includes('transaction pin is not configured')) {
      return t('requestMoney.errors.pinNotConfigured');
    }

    if (message.includes('transaction pin is required')) {
      return t('requestMoney.errors.pinRequired');
    }

    if (status === 423 || message.includes('temporarily locked')) {
      return t('requestMoney.errors.pinLocked');
    }

    if (status === 403 || message.includes('invalid transaction pin')) {
      return t('requestMoney.errors.invalidPin');
    }
  }

  return null;
}

export function getMoneyRequestErrorMessage(
  error: unknown,
  {
    context,
    t,
  }: {
    context: MoneyRequestErrorContext;
    t: Translate;
  }
) {
  if (isApiError(error)) {
    if (error.kind === 'network') {
      return t('requestMoney.errors.network');
    }

    const message = normalizeMessage(error.message);
    const contextual = mapContextualMoneyRequestError(context, error.status, message, t);

    if (contextual) {
      return contextual;
    }

    return t('requestMoney.errors.generic');
  }

  if (error instanceof ApiError || error instanceof Error) {
    return t('requestMoney.errors.generic');
  }

  return t('requestMoney.errors.generic');
}
