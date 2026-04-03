import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { authApi } from '@/features/auth/auth.api';
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  SetupTransactionPinRequest,
  StoredAuthSession,
} from '@/features/auth/auth.types';
import { getDeviceItem, removeDeviceItem, setDeviceItem } from '@/lib/storage/device-storage';

const AUTH_SESSION_STORAGE_KEY = 'yebapay.auth.session.v1';
const SIGN_OUT_MINIMUM_FEEDBACK_MS = 450;

type AuthStatus = 'bootstrapping' | 'authenticated' | 'unauthenticated';

type SessionContextValue = {
  status: AuthStatus;
  session: StoredAuthSession | null;
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  signIn: (request: LoginRequest) => Promise<StoredAuthSession>;
  signUp: (request: RegisterRequest) => Promise<StoredAuthSession>;
  signOut: () => Promise<void>;
  setupTransactionPin: (request: SetupTransactionPinRequest) => Promise<void>;
  refreshSession: () => Promise<StoredAuthSession | null>;
  reloadCurrentUser: () => Promise<AuthUser | null>;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

function toStoredSession(response: AuthResponse): StoredAuthSession {
  const now = Date.now();

  return {
    ...response,
    accessTokenExpiresAt: now + response.expiresInSeconds * 1000,
    refreshTokenExpiresAt: now + response.refreshTokenExpiresInSeconds * 1000,
  };
}

async function persistSession(session: StoredAuthSession) {
  await setDeviceItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

async function readStoredSession() {
  const rawValue = await getDeviceItem(AUTH_SESSION_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredAuthSession;
  } catch {
    await removeDeviceItem(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

async function clearPersistedSession() {
  await removeDeviceItem(AUTH_SESSION_STORAGE_KEY);
}

function isAccessTokenStillUsable(session: StoredAuthSession) {
  return session.accessTokenExpiresAt > Date.now() + 15_000;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('bootstrapping');
  const [session, setSession] = useState<StoredAuthSession | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedSession = await readStoredSession();

      if (!storedSession) {
        if (!cancelled) {
          setSession(null);
          setStatus('unauthenticated');
        }
        return;
      }

      if (isAccessTokenStillUsable(storedSession)) {
        if (!cancelled) {
          setSession(storedSession);
          setStatus('authenticated');
        }

        try {
          const refreshed = await authApi.refresh({
            refreshToken: storedSession.refreshToken,
          });
          const nextSession = toStoredSession(refreshed);
          await persistSession(nextSession);

          if (!cancelled) {
            setSession(nextSession);
          }
        } catch {
          // Keep the cached session while the access token is still valid.
        }

        return;
      }

      try {
        const refreshed = await authApi.refresh({
          refreshToken: storedSession.refreshToken,
        });
        const nextSession = toStoredSession(refreshed);
        await persistSession(nextSession);

        if (!cancelled) {
          setSession(nextSession);
          setStatus('authenticated');
        }
      } catch {
        await clearPersistedSession();

        if (!cancelled) {
          setSession(null);
          setStatus('unauthenticated');
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const contextValue = useMemo<SessionContextValue>(() => {
    const applyAuthResponse = async (response: AuthResponse) => {
      const nextSession = toStoredSession(response);
      await persistSession(nextSession);
      setSession(nextSession);
      setStatus('authenticated');
      return nextSession;
    };

    const signIn = async (request: LoginRequest) => {
      const response = await authApi.login(request);
      return applyAuthResponse(response);
    };

    const signUp = async (request: RegisterRequest) => {
      const response = await authApi.register(request);
      return applyAuthResponse(response);
    };

    const signOut = async () => {
      const refreshToken = session?.refreshToken;
      const minimumFeedbackDelay = wait(SIGN_OUT_MINIMUM_FEEDBACK_MS);

      if (refreshToken) {
        await Promise.allSettled([
          authApi.logout({ refreshToken } satisfies RefreshTokenRequest),
          minimumFeedbackDelay,
        ]);
      } else {
        await minimumFeedbackDelay;
      }

      setSession(null);
      setStatus('unauthenticated');
      await clearPersistedSession();
    };

    const setupTransactionPin = async (request: SetupTransactionPinRequest) => {
      if (!session?.accessToken) {
        throw new Error('No active session');
      }

      await authApi.setupTransactionPin(request, session.accessToken);
    };

    const refreshSession = async () => {
      if (!session?.refreshToken) {
        setSession(null);
        setStatus('unauthenticated');
        await clearPersistedSession();
        return null;
      }

      const response = await authApi.refresh({
        refreshToken: session.refreshToken,
      });

      return applyAuthResponse(response);
    };

    const reloadCurrentUser = async () => {
      if (!session?.accessToken) {
        return null;
      }

      const user = await authApi.me(session.accessToken);
      const nextSession = {
        ...session,
        user,
      };

      await persistSession(nextSession);
      setSession(nextSession);
      return user;
    };

    return {
      status,
      session,
      user: session?.user ?? null,
      accessToken: session?.accessToken ?? null,
      isAuthenticated: status === 'authenticated',
      isBootstrapping: status === 'bootstrapping',
      signIn,
      signUp,
      signOut,
      setupTransactionPin,
      refreshSession,
      reloadCurrentUser,
    };
  }, [session, status]);

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }

  return context;
}
