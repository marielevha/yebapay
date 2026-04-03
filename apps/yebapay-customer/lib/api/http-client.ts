import { env } from '@/config/env';
import { ApiError, extractApiErrorMessage } from '@/lib/api/api-error';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  accessToken?: string;
};

function joinUrl(baseUrl: string, path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return JSON.parse(text) as unknown;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers, accessToken } = options;

    try {
      const response = await fetch(joinUrl(this.baseUrl, path), {
        method,
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const payload = await parseResponseBody(response);

      if (!response.ok) {
        throw new ApiError({
          kind: 'http',
          status: response.status,
          payload,
          message:
            extractApiErrorMessage(payload) ??
            `HTTP ${response.status}`,
        });
      }

      return payload as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        throw new ApiError({
          kind: 'network',
          message: error.message,
        });
      }

      throw new ApiError({
        kind: 'unknown',
        message: 'Unknown API error',
      });
    }
  }
}

export const httpClient = new HttpClient(env.apiBaseUrl);
