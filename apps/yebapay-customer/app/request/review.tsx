import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { BrandMark } from '@/components/brand-mark';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { moneyRequestApi } from '@/features/money-request/money-request.api';
import { getMoneyRequestErrorMessage } from '@/features/money-request/money-request-errors';
import type { MoneyRequestQuoteResponse } from '@/features/money-request/money-request.types';
import { useMoneyRequestDetails } from '@/features/money-request/use-money-request-details';
import { useHomeWallets } from '@/features/wallet/use-home-wallets';
import {
  formatWalletBalance,
  getWalletTypeLabel,
  maskWalletNumber,
} from '@/features/wallet/wallet-presenter';
import type { WalletDetails } from '@/features/wallet/wallet.types';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

function formatMoney(value: number | null, currencyDisplayCode: string, language: string) {
  if (value === null || !currencyDisplayCode) {
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

function WalletSelectionSheet({
  visible,
  title,
  wallets,
  selectedWalletId,
  language,
  onClose,
  onSelect,
  getWalletLabel,
}: {
  visible: boolean;
  title: string;
  wallets: WalletDetails[];
  selectedWalletId: string;
  language: string;
  onClose: () => void;
  onSelect: (walletId: string) => void;
  getWalletLabel: (wallet: WalletDetails) => string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[styles.sheet, BrandShadow.card]}
        >
          <View style={styles.sheetHeader}>
            <ThemedText type="sectionTitle">{title}</ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={BrandColors.slate} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetOptions}
          >
            {wallets.map((wallet) => {
              const isSelected = wallet.id === selectedWalletId;

              return (
                <Pressable
                  key={wallet.id}
                  onPress={() => {
                    onSelect(wallet.id);
                    onClose();
                  }}
                  style={[
                    styles.sheetOption,
                    isSelected ? styles.sheetOptionSelected : null,
                  ]}
                >
                  <View style={styles.sheetOptionCopy}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {getWalletLabel(wallet)}
                    </ThemedText>
                    <ThemedText
                      type="bodySmall"
                      numberOfLines={1}
                      lightColor={BrandColors.slate}
                      darkColor={BrandColors.slate}
                    >
                      {maskWalletNumber(wallet.walletNumber)} · {formatWalletBalance(wallet, language)}
                    </ThemedText>
                  </View>

                  {isSelected ? <MaterialIcons name="check" size={20} color={BrandColors.palm} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function RouteRow({
  label,
  name,
  hint,
  isLast = false,
}: {
  label: string;
  name: string;
  hint: string;
  isLast?: boolean;
}) {
  return (
    <View style={styles.routeRow}>
      <View style={styles.routeRail}>
        <View style={styles.routeNodeOuter}>
          <View style={styles.routeNodeInner} />
        </View>
        {!isLast ? <View style={styles.routeLine} /> : null}
      </View>

      <View style={styles.routeCopy}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {name}
        </ThemedText>
        <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
          {hint}
        </ThemedText>
      </View>

      <ThemedText
        type="bodySmall"
        lightColor={BrandColors.slate}
        darkColor={BrandColors.slate}
        style={styles.routeLabel}
      >
        {label}
      </ThemedText>
    </View>
  );
}

function DetailRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
        {label}
      </ThemedText>
      <View style={styles.detailLeader} />
      <ThemedText type={strong ? 'defaultSemiBold' : 'bodySmall'}>{value}</ThemedText>
    </View>
  );
}

export default function MoneyRequestReviewScreen() {
  const { requestRef } = useLocalSearchParams<{ requestRef?: string }>();
  const { t, language } = useI18n();
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const {
    moneyRequest,
    isLoading: isLoadingRequest,
    errorMessage: requestErrorMessage,
  } = useMoneyRequestDetails(requestRef);
  const {
    wallets,
    isLoading: isLoadingWallets,
    errorMessage: walletErrorMessage,
  } = useHomeWallets();

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [quote, setQuote] = useState<MoneyRequestQuoteResponse | null>(null);
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  const [quoteErrorMessage, setQuoteErrorMessage] = useState<string | null>(null);

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

  const eligibleWallets = useMemo(() => {
    if (!moneyRequest) {
      return wallets;
    }

    return wallets.filter((wallet) => wallet.currencyCode === moneyRequest.currencyCode);
  }, [moneyRequest, wallets]);

  useEffect(() => {
    if (eligibleWallets.length === 0) {
      if (selectedWalletId !== null) {
        setSelectedWalletId(null);
      }
      return;
    }

    if (selectedWalletId === null || !eligibleWallets.some((wallet) => wallet.id === selectedWalletId)) {
      setSelectedWalletId(eligibleWallets[0].id);
    }
  }, [eligibleWallets, selectedWalletId]);

  const selectedWallet = useMemo(
    () => eligibleWallets.find((wallet) => wallet.id === selectedWalletId) ?? null,
    [eligibleWallets, selectedWalletId]
  );

  useEffect(() => {
    let active = true;

    if (
      !requestRef
      || !isAuthenticated
      || !accessToken
      || !moneyRequest?.payableByViewer
      || !selectedWallet
    ) {
      setQuote(null);
      setQuoteErrorMessage(null);
      setIsLoadingQuote(false);
      return;
    }

    setIsLoadingQuote(true);
    setQuoteErrorMessage(null);

    void requestWithSessionRetry((token) =>
      moneyRequestApi.quoteMoneyRequest(token, requestRef, {
        sourceWalletId: selectedWallet.id,
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
          setQuoteErrorMessage(getMoneyRequestErrorMessage(error, { context: 'quote', t }));
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
  }, [
    accessToken,
    isAuthenticated,
    moneyRequest?.payableByViewer,
    requestRef,
    requestWithSessionRetry,
    selectedWallet,
    t,
  ]);

  const hasMultipleWallets = eligibleWallets.length > 1;
  const noCompatibleWallet = Boolean(
    moneyRequest?.payableByViewer && !isLoadingWallets && eligibleWallets.length === 0
  );
  const amountLabel = formatMoney(
    quote?.amount ?? moneyRequest?.amount ?? null,
    moneyRequest?.currencyDisplayCode ?? quote?.currencyDisplayCode ?? '',
    language
  );
  const feeLabel = formatMoney(
    quote?.feeAmount ?? null,
    quote?.currencyDisplayCode ?? moneyRequest?.currencyDisplayCode ?? '',
    language
  );
  const totalDebitLabel = formatMoney(
    quote?.totalDebit ?? null,
    quote?.currencyDisplayCode ?? moneyRequest?.currencyDisplayCode ?? '',
    language
  );
  const expiresAtLabel = formatDateTime(moneyRequest?.expiresAt ?? quote?.expiresAt ?? null, language);
  const canContinue = Boolean(moneyRequest?.payableByViewer && selectedWallet && quote && !isLoadingQuote);
  const walletLabel = useCallback(
    (wallet: WalletDetails) => getWalletTypeLabel(wallet.walletType, t),
    [t]
  );

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!requestRef) {
    return <Redirect href="/request" />;
  }

  if (!isLoadingRequest && moneyRequest && !moneyRequest.payableByViewer) {
    return <Redirect href={`/request/${requestRef}`} />;
  }

  const footer = moneyRequest ? (
    <AuthPrimaryButton
      label={t('requestMoney.review.submit')}
      disabled={!canContinue}
      onPress={() => {
        if (!selectedWallet) {
          return;
        }

        router.push({
          pathname: '/request/pay',
          params: {
            requestRef,
            sourceWalletId: selectedWallet.id,
          },
        });
      }}
    />
  ) : undefined;

  return (
    <TransferScreenShell
      title={t('requestMoney.review.title')}
      onBack={() => router.back()}
      contentSurface="plain"
      topBarVariant="title"
      copyTitleHidden
      footer={footer}
    >
      {isLoadingRequest ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={BrandColors.palm} />
        </View>
      ) : requestErrorMessage ? (
        <AuthFormAlert message={requestErrorMessage} />
      ) : moneyRequest ? (
        <View style={styles.layout}>
          {walletErrorMessage && !selectedWallet ? <AuthFormAlert message={walletErrorMessage} /> : null}
          {quoteErrorMessage ? <AuthFormAlert message={quoteErrorMessage} /> : null}
          {noCompatibleWallet ? (
            <AuthFormAlert message={t('requestMoney.review.noCompatibleWallet')} />
          ) : null}

          <View style={styles.hero}>
            <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
              {t('requestMoney.detail.requestedByLabel')}
            </ThemedText>
            <ThemedText type="title" style={styles.heroAmount}>
              {amountLabel}
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.heroName}>
              {moneyRequest.requesterDisplayName}
            </ThemedText>
          </View>

          {selectedWallet ? (
            <View style={styles.walletSection}>
              <View style={styles.walletSectionHeader}>
                <ThemedText type="sectionTitle">{t('requestMoney.review.sourceWallet')}</ThemedText>
                {isLoadingQuote ? <ActivityIndicator size="small" color={BrandColors.palm} /> : null}
              </View>

              <Pressable
                onPress={() => {
                  if (hasMultipleWallets) {
                    setWalletSheetOpen(true);
                  }
                }}
                disabled={!hasMultipleWallets}
                style={[styles.walletRow, BrandShadow.card]}
              >
                <View style={styles.walletBadge}>
                  <BrandMark size={18} />
                </View>

                <View style={styles.walletCopy}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {walletLabel(selectedWallet)}
                  </ThemedText>
                  <ThemedText
                    type="bodySmall"
                    numberOfLines={1}
                    lightColor={BrandColors.slate}
                    darkColor={BrandColors.slate}
                  >
                    {maskWalletNumber(selectedWallet.walletNumber)} · {formatWalletBalance(selectedWallet, language)}
                  </ThemedText>
                </View>

                {hasMultipleWallets ? (
                  <MaterialIcons name="keyboard-arrow-down" size={20} color={BrandColors.slate} />
                ) : null}
              </Pressable>
            </View>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="sectionTitle">{t('requestMoney.review.routingTitle')}</ThemedText>

            <View style={styles.routeList}>
              <RouteRow
                label={t('transactionsPage.details.fromLabel')}
                name={selectedWallet ? walletLabel(selectedWallet) : '...'}
                hint={
                  selectedWallet
                    ? `${maskWalletNumber(selectedWallet.walletNumber)} · ${formatWalletBalance(selectedWallet, language)}`
                    : '...'
                }
              />
              <RouteRow
                label={t('transactionsPage.details.toLabel')}
                name={moneyRequest.requesterDisplayName}
                hint={moneyRequest.targetWalletNumber ?? '-'}
                isLast
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <ThemedText type="sectionTitle">{t('requestMoney.review.summaryTitle')}</ThemedText>

            <View style={styles.detailList}>
              <DetailRow label={t('transfer.summary.reference')} value={moneyRequest.requestRef} />
              <DetailRow label={t('transfer.summary.amount')} value={amountLabel} />
              <DetailRow label={t('transfer.summary.fees')} value={feeLabel} />
              <DetailRow label={t('transfer.summary.totalDebit')} value={totalDebitLabel} strong />
              {expiresAtLabel ? (
                <DetailRow label={t('requestMoney.detail.expiresAt')} value={expiresAtLabel} />
              ) : null}
            </View>
          </View>

          {moneyRequest.reason ? (
            <>
              <View style={styles.divider} />

              <View style={styles.section}>
                <ThemedText type="sectionTitle">{t('requestMoney.detail.note')}</ThemedText>
                <View style={styles.noteBox}>
                  <ThemedText type="default">{moneyRequest.reason}</ThemedText>
                </View>
              </View>
            </>
          ) : null}

          {selectedWallet ? (
            <WalletSelectionSheet
              visible={walletSheetOpen}
              title={t('requestMoney.review.walletTitle')}
              wallets={eligibleWallets}
              selectedWalletId={selectedWallet.id}
              language={language}
              onClose={() => setWalletSheetOpen(false)}
              onSelect={setSelectedWalletId}
              getWalletLabel={walletLabel}
            />
          ) : null}
        </View>
      ) : null}
    </TransferScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layout: {
    gap: 20,
    paddingBottom: 8,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
  },
  heroAmount: {
    textAlign: 'center',
  },
  heroName: {
    textAlign: 'center',
  },
  walletSection: {
    gap: 12,
  },
  walletSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  walletBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.cloud,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  walletCopy: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: 14,
  },
  routeList: {
    gap: 16,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeRail: {
    alignItems: 'center',
    paddingTop: 2,
  },
  routeNodeOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E9F4EF',
  },
  routeNodeInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.palm,
  },
  routeLine: {
    width: 2,
    flex: 1,
    minHeight: 32,
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: '#D8E7DF',
  },
  routeCopy: {
    flex: 1,
    gap: 2,
  },
  routeLabel: {
    paddingTop: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1EAE4',
  },
  detailList: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLeader: {
    flex: 1,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE6E0',
    borderStyle: 'dashed',
  },
  noteBox: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 18, 15, 0.18)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  sheet: {
    maxHeight: '68%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
    gap: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetOptions: {
    gap: 10,
    paddingBottom: 6,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sheetOptionSelected: {
    backgroundColor: BrandColors.cloud,
  },
  sheetOptionCopy: {
    flex: 1,
    gap: 2,
  },
});
