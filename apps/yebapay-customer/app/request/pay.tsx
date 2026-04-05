import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AuthField } from '@/components/auth/auth-field';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { TransferSummaryCard } from '@/components/transfer/transfer-summary-card';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { moneyRequestApi } from '@/features/money-request/money-request.api';
import { getMoneyRequestErrorMessage } from '@/features/money-request/money-request-errors';
import type { MoneyRequestQuoteResponse } from '@/features/money-request/money-request.types';
import { sanitizeTransferPin } from '@/features/transfer/transfer-input';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

function formatMoney(value: number, currencyDisplayCode: string, language: string) {
  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ${currencyDisplayCode}`;
}

function createMoneyRequestIdempotencyKey() {
  return `money-request-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function MoneyRequestPayScreen() {
  const { requestRef } = useLocalSearchParams<{ requestRef?: string }>();
  const { t, language } = useI18n();
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

    void requestWithSessionRetry((token) => moneyRequestApi.quoteMoneyRequest(token, requestRef))
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
  }, [accessToken, isAuthenticated, requestRef, requestWithSessionRetry, t]);

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
      subtitle={t('requestMoney.pay.subtitle')}
      onBack={() => router.back()}
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
        <>
          <TransferSummaryCard
            title={t('requestMoney.pay.summaryTitle')}
            rows={[
              {
                label: t('requestMoney.detail.requester'),
                value: quote.requesterDisplayName,
              },
              {
                label: t('transfer.summary.fromWallet'),
                value: quote.sourceWalletNumber,
              },
              {
                label: t('transfer.summary.amount'),
                value: formatMoney(quote.amount, quote.currencyDisplayCode, language),
              },
              {
                label: t('transfer.summary.fees'),
                value: formatMoney(quote.feeAmount, quote.currencyDisplayCode, language),
              },
              {
                label: t('transfer.summary.totalDebit'),
                value: formatMoney(quote.totalDebit, quote.currencyDisplayCode, language),
                strong: true,
              },
            ]}
          />

          {quote.reason ? (
            <View style={styles.noteBlock}>
              <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {t('requestMoney.detail.note')}
              </ThemedText>
              <ThemedText type="default">{quote.reason}</ThemedText>
            </View>
          ) : null}

          <AuthField
            label={t('requestMoney.pay.pinLabel')}
            icon="pin"
            placeholder={t('requestMoney.pay.pinPlaceholder')}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            secureTextEntry
            maxLength={6}
            value={pin}
            onChangeText={(value) => {
              setPin(sanitizeTransferPin(value));

              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
          />
        </>
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
  noteBlock: {
    gap: 10,
  },
});
