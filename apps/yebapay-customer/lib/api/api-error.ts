export type ApiErrorKind = 'network' | 'http' | 'unknown';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly payload?: unknown;

  constructor({
    message,
    kind,
    status = null,
    payload,
  }: {
    message: string;
    kind: ApiErrorKind;
    status?: number | null;
    payload?: unknown;
  }) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
    this.payload = payload;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function firstArrayMessage(value: unknown): string | undefined {
  if (!Array.isArray(value) || value.length === 0) {
    return undefined;
  }

  const first = value[0];
  return typeof first === 'string' && first.trim() ? first.trim() : undefined;
}

function firstRecordMessage(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  return Object.values(value as Record<string, unknown>)
    .map((entry) => {
      if (typeof entry === 'string' && entry.trim()) {
        return entry.trim();
      }

      return firstArrayMessage(entry);
    })
    .find((entry): entry is string => Boolean(entry));
}

export function extractApiErrorMessage(payload: unknown) {
  if (!payload) {
    return undefined;
  }

  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (typeof payload !== 'object') {
    return undefined;
  }

  const candidate = payload as Record<string, unknown>;

  const directKeys = ['message', 'detail', 'error', 'title'] as const;
  for (const key of directKeys) {
    const value = candidate[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return firstRecordMessage(candidate.errors) ?? firstRecordMessage(candidate);
}
