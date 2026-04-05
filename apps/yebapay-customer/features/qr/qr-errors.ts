import { ApiError, isApiError } from '@/lib/api/api-error';

type Translate = (key: string) => string;

function normalizeMessage(message: string | undefined) {
  return message?.trim().toLowerCase() ?? '';
}

export function getQrDecodeErrorMessage(error: unknown, t: Translate) {
  if (isApiError(error)) {
    if (error.kind === 'network') {
      return t('transfer.qr.errors.network');
    }

    const message = normalizeMessage(error.message);

    if (error.status === 401) {
      return t('transfer.qr.errors.sessionExpired');
    }

    if (error.status === 429) {
      return t('transfer.qr.errors.tooManyAttempts');
    }

    if (error.status !== null && error.status >= 500) {
      return t('transfer.qr.errors.server');
    }

    if (
      message.includes('invalid qr payload')
      || message.includes('unknown qr reference')
      || message.includes('qr data is required')
      || message.includes('invalid qr signature')
      || message.includes('qr signature is invalid')
      || message.includes('qr payload is malformed')
      || message.includes('qr reference is missing')
      || message.includes('qr not found')
    ) {
      return t('transfer.qr.errors.invalid');
    }

    if (message.includes('qr token has expired') || message.includes('qr has expired')) {
      return t('transfer.qr.errors.expired');
    }

    if (message.includes('not available for transfers')) {
      return t('transfer.qr.errors.unsupported');
    }

    return t('transfer.qr.errors.generic');
  }

  if (error instanceof ApiError || error instanceof Error) {
    return t('transfer.qr.errors.generic');
  }

  return t('transfer.qr.errors.generic');
}
