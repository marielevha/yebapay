import { MaterialIcons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import QRCode from 'react-native-qrcode-svg';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { moneyRequestApi } from '@/features/money-request/money-request.api';
import { getMoneyRequestErrorMessage } from '@/features/money-request/money-request-errors';
import { useMoneyRequestDetails } from '@/features/money-request/use-money-request-details';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

function formatMoney(value: number | null, currencyDisplayCode: string, language: string) {
  if (value === null) {
    return '...';
  }

  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ${currencyDisplayCode}`;
}

function formatDateTime(value: string | null, language: string) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

function StatusPill({
  label,
  tone,
  compact = false,
}: {
  label: string;
  tone: 'success' | 'warning' | 'neutral' | 'danger';
  compact?: boolean;
}) {
  const stylesByTone = {
    success: { backgroundColor: 'rgba(30, 107, 91, 0.12)', color: BrandColors.palm },
    warning: { backgroundColor: 'rgba(215, 154, 43, 0.14)', color: '#9A6B00' },
    neutral: { backgroundColor: '#EFF5F1', color: BrandColors.slate },
    danger: { backgroundColor: 'rgba(216, 92, 52, 0.12)', color: BrandColors.clay },
  } as const;

  const toneStyles = stylesByTone[tone];

  return (
    <View
      style={[
        styles.statusPill,
        compact ? styles.statusPillCompact : null,
        { backgroundColor: toneStyles.backgroundColor },
      ]}>
      <ThemedText type="bodySmall" lightColor={toneStyles.color} darkColor={toneStyles.color}>
        {label}
      </ThemedText>
    </View>
  );
}

function MetadataRow({
  label,
  value,
  isLast = false,
  tone = 'light',
}: {
  label: string;
  value: string;
  isLast?: boolean;
  tone?: 'light' | 'dark';
}) {
  const labelColor = tone === 'dark' ? BrandColors.slate : BrandColors.slate;
  const valueColor = tone === 'dark' ? BrandColors.ink : BrandColors.ink;

  return (
    <View
      style={[
        styles.metadataRow,
        tone === 'dark' ? styles.metadataRowDark : null,
        isLast ? styles.metadataRowLast : null,
      ]}>
      <ThemedText type="bodySmall" lightColor={labelColor} darkColor={labelColor}>
        {label}
      </ThemedText>
      <ThemedText
        type="bodySmall"
        style={styles.metadataValue}
        lightColor={valueColor}
        darkColor={valueColor}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function MoneyRequestDetailsScreen() {
  const { requestRef } = useLocalSearchParams<{ requestRef?: string }>();
  const { t, language } = useI18n();
  const { accessToken, refreshSession } = useSession();
  const { moneyRequest, isLoading, errorMessage, reload } = useMoneyRequestDetails(requestRef);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const qrCardRef = useRef<View | null>(null);

  const runWithSessionRetry = useCallback(
    async function runWithSessionRetry<T>(request: (token: string) => Promise<T>): Promise<T> {
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

  const handleShare = useCallback(async () => {
    if (!moneyRequest) {
      return;
    }

    setActionErrorMessage(null);

    const fallbackMessage = t('requestMoney.detail.shareMessage', {
      requester: moneyRequest.requesterDisplayName,
      amount: formatMoney(moneyRequest.amount, moneyRequest.currencyDisplayCode, language),
      requestRef: moneyRequest.requestRef,
    });

    try {
      if (qrCardRef.current) {
        const imageUri = await captureRef(qrCardRef.current, {
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(imageUri, {
            mimeType: 'image/png',
            dialogTitle: t('requestMoney.detail.share'),
          });
          return;
        }
      }

      await Share.share({ message: fallbackMessage });
    } catch (error) {
      setActionErrorMessage(getMoneyRequestErrorMessage(error, { context: 'details', t }));
    }
  }, [language, moneyRequest, t]);

  const handleCancel = useCallback(async () => {
    if (!moneyRequest || !moneyRequest.cancelableByViewer || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setActionErrorMessage(null);

    try {
      await runWithSessionRetry((token) => moneyRequestApi.cancelMoneyRequest(token, moneyRequest.requestRef));
      await reload();
    } catch (error) {
      setActionErrorMessage(getMoneyRequestErrorMessage(error, { context: 'cancel', t }));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, moneyRequest, reload, runWithSessionRetry, t]);

  const handleDecline = useCallback(async () => {
    if (!moneyRequest || !moneyRequest.declinableByViewer || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setActionErrorMessage(null);

    try {
      await runWithSessionRetry((token) => moneyRequestApi.declineMoneyRequest(token, moneyRequest.requestRef));
      await reload();
    } catch (error) {
      setActionErrorMessage(getMoneyRequestErrorMessage(error, { context: 'decline', t }));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, moneyRequest, reload, runWithSessionRetry, t]);

  const statusTone =
    moneyRequest?.status === 'PAID'
      ? 'success'
      : moneyRequest?.status === 'PENDING'
        ? 'warning'
        : moneyRequest?.status === 'DECLINED' || moneyRequest?.status === 'CANCELLED'
          ? 'danger'
          : 'neutral';

  const statusLabel = moneyRequest ? t(`requestMoney.status.${moneyRequest.status}`) : '';
  const createdAtLabel = moneyRequest ? formatDateTime(moneyRequest.createdAt, language) : null;
  const expiresAtLabel = moneyRequest ? formatDateTime(moneyRequest.expiresAt, language) : null;
  const amountLabel = moneyRequest
    ? formatMoney(moneyRequest.amount, moneyRequest.currencyDisplayCode, language)
    : '...';
  const qrValue = moneyRequest?.qr?.qrRef ?? null;

  if (moneyRequest?.viewerIsRequester) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.requesterScreen}>
        <View style={styles.requesterGlowLeft} />
        <View style={styles.requesterGlowRight} />

        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={[styles.headerAction, styles.headerActionDark]} hitSlop={8}>
            <MaterialIcons name="arrow-back-ios-new" size={18} color={BrandColors.ink} />
          </Pressable>

          <ThemedText type="defaultSemiBold" lightColor={BrandColors.ink} darkColor={BrandColors.ink}>
            {t('requestMoney.detail.shareTitle')}
          </ThemedText>

          <View style={styles.headerGhost} />
        </View>

        <ScrollView
          contentContainerStyle={styles.requesterContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.requesterStateWrap}>
              <ActivityIndicator color={BrandColors.palm} />
            </View>
          ) : errorMessage ? (
            <AuthFormAlert message={errorMessage} />
          ) : moneyRequest ? (
            <View style={styles.requestPoster}>
              <View style={styles.requestPosterHeader}>
                <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                  {t('requestMoney.detail.requestSummaryLabel')}
                </ThemedText>
                <ThemedText type="title" style={styles.requesterAmount} lightColor={BrandColors.ink} darkColor={BrandColors.ink}>
                  {amountLabel}
                </ThemedText>
              </View>

              {moneyRequest.qr ? (
                <View style={styles.scannerStage}>
                  <View style={styles.scannerAuraBlue} />
                  <View style={styles.scannerAuraGreen} />
                  <View style={styles.scanFrame}>
                    <View style={[styles.scanCorner, styles.scanCornerTopLeft]} />
                    <View style={[styles.scanCorner, styles.scanCornerTopRight]} />
                    <View style={[styles.scanCorner, styles.scanCornerBottomLeft]} />
                    <View style={[styles.scanCorner, styles.scanCornerBottomRight]} />

                    <View ref={qrCardRef} collapsable={false} style={styles.qrPanel}>
                      <QRCode
                        value={qrValue ?? moneyRequest.qr.signedPayload}
                        size={208}
                        ecl="H"
                        quietZone={16}
                        logo={qrLogo}
                        logoSize={40}
                        logoMargin={4}
                        logoBackgroundColor={BrandColors.white}
                        logoBorderRadius={14}
                      />
                    </View>
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          {actionErrorMessage ? <AuthFormAlert message={actionErrorMessage} /> : null}
        </ScrollView>

        {moneyRequest ? (
          <View style={styles.requesterFooter}>
            <View style={styles.requesterActionsRow}>
              <View style={styles.requesterActionPrimary}>
                <AuthPrimaryButton
                  label={t('requestMoney.detail.share')}
                  onPress={() => void handleShare()}
                  disabled={!moneyRequest.qr}
                />
              </View>

              {moneyRequest.cancelableByViewer ? (
                <Pressable
                  onPress={() => void handleCancel()}
                  disabled={isSubmitting}
                  style={({ pressed }) => [
                    styles.requesterSecondaryButton,
                    isSubmitting ? styles.requesterSecondaryButtonDisabled : null,
                    pressed && !isSubmitting ? styles.requesterSecondaryButtonPressed : null,
                  ]}>
                  <ThemedText type="defaultSemiBold" lightColor={BrandColors.clay} darkColor={BrandColors.clay}>
                    {isSubmitting ? t('requestMoney.detail.cancelling') : t('requestMoney.detail.cancel')}
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    );
  }

  return (
    <TransferScreenShell
      title={t('requestMoney.detail.payTitle')}
      onBack={() => router.back()}
      contentSurface="plain"
      topBarVariant="title"
      copyTitleHidden
      footer={
        moneyRequest?.payableByViewer ? (
          <View style={styles.footerActions}>
            <AuthPrimaryButton
              label={t('requestMoney.detail.continueToPay')}
              onPress={() => router.push({ pathname: '/request/pay', params: { requestRef: moneyRequest.requestRef } })}
            />
            {moneyRequest.declinableByViewer ? (
              <Pressable onPress={() => void handleDecline()} disabled={isSubmitting} hitSlop={8}>
                <ThemedText type="link" lightColor={BrandColors.clay} darkColor={BrandColors.clay}>
                  {isSubmitting ? t('requestMoney.detail.declining') : t('requestMoney.detail.decline')}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        ) : undefined
      }>
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={BrandColors.palm} />
        </View>
      ) : errorMessage ? (
        <AuthFormAlert message={errorMessage} />
      ) : moneyRequest ? (
        <View style={styles.layout}>
          <View style={styles.hero}>
            <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
              {t('requestMoney.detail.requestedByLabel')}
            </ThemedText>
            <ThemedText type="title" style={styles.amountValue}>
              {amountLabel}
            </ThemedText>
            <StatusPill label={statusLabel} tone={statusTone} />
            <ThemedText type="defaultSemiBold" style={styles.requesterName}>
              {moneyRequest.requesterDisplayName}
            </ThemedText>
          </View>

          <View style={styles.metadata}>
            <MetadataRow label={t('requestMoney.detail.requester')} value={moneyRequest.requesterDisplayName} />
            {moneyRequest.targetWalletNumber ? (
              <MetadataRow label={t('requestMoney.detail.wallet')} value={moneyRequest.targetWalletNumber} />
            ) : null}
            {createdAtLabel ? (
              <MetadataRow label={t('requestMoney.detail.createdAt')} value={createdAtLabel} />
            ) : null}
            {expiresAtLabel ? (
              <MetadataRow label={t('requestMoney.detail.expiresAt')} value={expiresAtLabel} />
            ) : null}
            {moneyRequest.reason ? (
              <MetadataRow label={t('requestMoney.detail.note')} value={moneyRequest.reason} isLast />
            ) : null}
          </View>

          {actionErrorMessage ? <AuthFormAlert message={actionErrorMessage} /> : null}
        </View>
      ) : null}
    </TransferScreenShell>
  );
}

const styles = StyleSheet.create({
  requesterScreen: {
    flex: 1,
    backgroundColor: BrandColors.cloud,
  },
  requesterGlowLeft: {
    position: 'absolute',
    left: -60,
    top: 120,
    width: 220,
    height: 320,
    borderRadius: 110,
    backgroundColor: 'rgba(30, 107, 91, 0.10)',
  },
  requesterGlowRight: {
    position: 'absolute',
    right: -40,
    top: 70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(215, 154, 43, 0.14)',
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionDark: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#DFE9E2',
  },
  headerGhost: {
    width: 40,
    height: 40,
  },
  requesterContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 22,
  },
  requesterStateWrap: {
    flex: 1,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestPoster: {
    gap: 24,
  },
  requestPosterHeader: {
    alignItems: 'center',
    gap: 10,
  },
  requesterAmount: {
    textAlign: 'center',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  scannerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 328,
  },
  scannerAuraBlue: {
    position: 'absolute',
    width: 252,
    height: 252,
    borderRadius: 34,
    backgroundColor: 'rgba(30, 107, 91, 0.16)',
    transform: [{ rotate: '-6deg' }],
  },
  scannerAuraGreen: {
    position: 'absolute',
    width: 238,
    height: 238,
    borderRadius: 34,
    backgroundColor: 'rgba(215, 154, 43, 0.18)',
    transform: [{ rotate: '7deg' }],
  },
  scanFrame: {
    width: 272,
    height: 272,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scanCorner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: 'rgba(18, 49, 46, 0.38)',
  },
  scanCornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopLeftRadius: 14,
  },
  scanCornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopRightRadius: 14,
  },
  scanCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomLeftRadius: 14,
  },
  scanCornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomRightRadius: 14,
  },
  qrPanel: {
    width: 224,
    height: 224,
    borderRadius: 28,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1EBE5',
  },
  requesterFooter: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 16,
  },
  requesterActionsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  requesterActionPrimary: {
    flex: 1,
  },
  requesterSecondaryButton: {
    minHeight: 56,
    minWidth: 132,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(216, 92, 52, 0.24)',
    backgroundColor: 'rgba(216, 92, 52, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  requesterSecondaryButtonDisabled: {
    opacity: 0.5,
  },
  requesterSecondaryButtonPressed: {
    opacity: 0.85,
  },
  layout: {
    gap: 20,
  },
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  amountValue: {
    textAlign: 'center',
  },
  requesterName: {
    textAlign: 'center',
  },
  metadata: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E4ECE7',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 18,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EEE9',
  },
  metadataRowDark: {
    borderBottomColor: '#E7EEE9',
  },
  metadataRowLast: {
    borderBottomWidth: 0,
  },
  metadataValue: {
    flex: 1,
    textAlign: 'right',
  },
  footerActions: {
    gap: 14,
  },
});

const qrLogo = require('../../assets/brand/yebapay-badge.png');
