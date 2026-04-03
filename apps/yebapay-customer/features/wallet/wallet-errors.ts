import { ApiError, isApiError } from '@/lib/api/api-error';

export function getWalletErrorMessage(
  error: unknown,
  {
    genericMessage,
    networkMessage,
  }: {
    genericMessage: string;
    networkMessage: string;
  }
) {
  if (isApiError(error)) {
    if (error.kind === 'network') {
      return networkMessage;
    }

    if (error.message && error.message !== `HTTP ${error.status}`) {
      return error.message;
    }
  }

  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return genericMessage;
}
