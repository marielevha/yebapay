import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_API_PORT = process.env.EXPO_PUBLIC_API_PORT?.trim() || '9999';
const API_PREFIX = '/api/v1';

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, '');

  if (trimmed.endsWith(API_PREFIX)) {
    return trimmed;
  }

  return `${trimmed}${API_PREFIX}`;
}

function resolveExpoHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) {
    return null;
  }

  const host = hostUri.split(':')[0]?.trim();

  if (!host) {
    return null;
  }

  if (Platform.OS === 'android' && (host === 'localhost' || host === '127.0.0.1')) {
    return '10.0.2.2';
  }

  return host;
}

function resolveApiBaseUrl() {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (explicitBaseUrl && explicitBaseUrl.toLowerCase() !== 'auto') {
    return normalizeBaseUrl(explicitBaseUrl);
  }

  const expoHost = resolveExpoHost();

  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_API_PORT}${API_PREFIX}`;
  }

  const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
  return `http://${defaultHost}:${DEFAULT_API_PORT}${API_PREFIX}`;
}

export const env = {
  apiBaseUrl: resolveApiBaseUrl(),
} as const;
