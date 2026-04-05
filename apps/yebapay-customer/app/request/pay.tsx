import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthCodeInput } from '@/components/auth/auth-code-input';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { moneyRequestApi } from '@/features/money-request/money-request.api';
import { getMoneyRequestErrorMessage } from '@/features/money-request/money-request-errors';
import type { MoneyRequestQuoteResponse } from '@/features/money-request/money-request.types';
import { sanitizeTransferPin } from '@/features/transfer/transfer-input';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

function createMoneyRequestIdempotencyKey() {
  return `money-request-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function MoneyRequestPayScreen() {
  const { requestRef, sourceWalletId } = useLocalSearchParams<{ requestRef?: string; sourceWalletId?: string }>();
  const { t } = useI18n();
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const [quote, setQuote] = useState<MoneyRequestQuoteResponse | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestWithSessionRetry = useCallback(
    async function requestWithSessionRetry<T>(request: (token: string) => Promise<T>): Promise<T> {
      if (!accessToken) {
        throw new Error('No active session');
      }

      try {
        return await request(accessToken);
      } catch (error) {
        const shouldRetry = isApiError(error) && error.status === 401;

        if (shouldRetry) {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            return request(refreshed.accessToken);
          }
        }

        throw error;
      }
    },
    [accessToken, refreshSession]
  );

  useEffect(() => {
    let active = true;

    if (!requestRef || !isAuthenticated || !accessToken) {
      setQuote(null);
      setErrorMessage(null);
      setIsLoadingQuote(false);
      return;
    }

    setIsLoadingQuote(true);
    setErrorMessage(null);

    void requestWithSessionRetry((token) =>
      moneyRequestApi.quoteMoneyRequest(token, requestRef, {
        sourceWalletId: sourceWalletId || undefined,
      })
    )
      .then((response) => {
        if (active) {
          setQuote(response);
        }
      })
      .catch((error) => {
        if (active) {
          setQuote(null);
          setErrorMessage(getMoneyRequestErrorMessage(error, { context: 'quote', t }));
        }
      })
      .finally(() => {
        if (active) {
          setIsLoadingQuote(false);
        }
      });

    return () => {
      active = false;
    };
  }, [accessToken, isAuthenticated, requestRef, requestWithSessionRetry, sourceWalletId, t]);

  const canSubmit = useMemo(() => Boolean(quote && pin.length >= 4 && !submitting), [pin.length, quote, submitting]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!requestRef) {
    return <Redirect href="/request" />;
  }

  const handleSubmit = async () => {
    if (!quote || !canSubmit) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await requestWithSessionRetry((token) =>
        moneyRequestApi.acceptMoneyRequest(token, requestRef, {
          sourceWalletId: sourceWalletId || undefined,
          idempotencyKey: createMoneyRequestIdempotencyKey(),
          pin,
          description: quote.reason ?? undefined,
        })
      );

      router.replace({
        pathname: '/request/success',
        params: {
          transactionId: response.transactionId,
        },
      });
    } catch (error) {
      setErrorMessage(getMoneyRequestErrorMessage(error, { context: 'pay', t }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TransferScreenShell
      title={t('requestMoney.pay.title')}
      onBack={() => router.back()}
      contentSurface="plain"
      topBarVariant="title"
      copyTitleHidden
      footer={
        <AuthPrimaryButton
          label={t('requestMoney.pay.submit')}
          loadingLabel={t('requestMoney.pay.paying')}
          loading={submitting}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      }>
      {isLoadingQuote ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={BrandColors.palm} />
        </View>
      ) : quote ? (
        <View style={styles.content}>
          <View style={styles.pinIntro}>
            <View style={styles.pinBadge}>
              <ThemedText type="defaultSemiBold" style={styles.pinBadgeText}>
                PIN
              </ThemedText>
            </View>
          </View>

          <AuthCodeInput
            length={4}
            value={pin}
            onChangeText={(value) => {
              setPin(sanitizeTransferPin(value));

              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
          />
        </View>
      ) : null}

      {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}
    </TransferScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingTop: 16,
    gap: 24,
  },
  pinIntro: {
    alignItems: 'center',
    gap: 12,
  },
  pinBadge: {
    minWidth: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.cloud,
    borderWidth: 1,
    borderColor: '#DDE8E1',
  },
  pinBadgeText: {
    letterSpacing: 1.2,
  },
});
