import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import type { ComponentProps } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/navigation/app-top-bar';
import { ThemedText } from '@/components/themed-text';
import { Brand, BrandColors, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { qrApi } from '@/features/qr/qr.api';
import type { QrToken } from '@/features/qr/qr.types';
import { useHomeWallets } from '@/features/wallet/use-home-wallets';
import { useHomeTransactions } from '@/features/wallet/use-home-transactions';
import { presentTransaction } from '@/features/wallet/transaction-presenter';
import { useTransferFlow } from '@/features/transfer/transfer-flow-provider';
import type { WalletDetails } from '@/features/wallet/wallet.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type ActionItem = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  labelKey: string;
  route?: Href;
};

const ACTIONS: ActionItem[] = [
  {
    icon: 'qr-code-scanner',
    labelKey: 'home.actions.scanPay',
    route: '/(tabs)/scanner',
  },
  {
    icon: 'arrow-downward',
    labelKey: 'home.actions.topUp',
  },
  {
    icon: 'request-page',
    labelKey: 'home.actions.request',
    route: '/request',
  },
  {
    icon: 'swap-horiz',
    labelKey: 'home.actions.transfer',
    route: '/transfer/recipient',
  },
];

const CARD_PATTERN_DOTS = Array.from({ length: 18 }, (_, index) => ({
  key: `dot-${index}`,
  top: Math.floor(index / 6) * 15,
  left: (index % 6) * 15,
  opacity: [0.16, 0.24, 0.34, 0.48, 0.28, 0.18][index % 6],
}));

function getWalletTypeLabel(walletType: WalletDetails['walletType'], t: (key: string) => string) {
  switch (walletType) {
    case 'MERCHANT':
      return t('home.wallets.types.merchant');
    case 'AGENT':
      return t('home.wallets.types.agent');
    case 'SYSTEM':
      return t('home.wallets.types.system');
    case 'PERSONAL':
    default:
      return t('home.wallets.types.personal');
  }
}

function formatWalletBalance(wallet: WalletDetails, language: string) {
  const locale = language === 'en' ? 'en-US' : 'fr-FR';
  const amount = wallet.availableBalance ?? 0;
  const formatter = new Intl.NumberFormat(locale, {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  });

  return `${formatter.format(amount)} ${wallet.currencyDisplayCode}`;
}

function maskWalletNumber(walletNumber: string) {
  const compactValue = walletNumber.replace(/\s+/g, '');

  if (!compactValue) {
    return '••••';
  }

  if (compactValue.length <= 4) {
    return compactValue;
  }

  return `•••• ${compactValue.slice(-4)}`;
}

function WalletQrModal({
  visible,
  wallet,
  walletLabel,
  qr,
  isLoading,
  errorMessage,
  title,
  onClose,
  onRetry,
}: {
  visible: boolean;
  wallet: WalletDetails | null;
  walletLabel: string | null;
  qr: QrToken | null;
  isLoading: boolean;
  errorMessage: string | null;
  title: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  const qrValue = qr?.qrRef ?? qr?.signedPayload ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.qrOverlay} onPress={onClose}>
        <Pressable style={[styles.qrSheet, BrandShadow.card]} onPress={(event) => event.stopPropagation()}>
          <View style={styles.qrSheetHeader}>
            <ThemedText type="sectionTitle" style={styles.qrTitle}>
              {title}
            </ThemedText>

            <Pressable onPress={onClose} hitSlop={8} style={styles.qrCloseButton}>
              <MaterialIcons name="close" size={20} color={BrandColors.ink} />
            </Pressable>
          </View>

          {isLoading ? (
            <View style={styles.qrStateWrap}>
              <ActivityIndicator color={BrandColors.palm} />
            </View>
          ) : errorMessage ? (
            <View style={styles.qrStateWrap}>
              <AuthFormAlert message={errorMessage} />
              <Pressable onPress={onRetry} hitSlop={8}>
                <ThemedText type="link" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
                  Retry
                </ThemedText>
              </Pressable>
            </View>
          ) : qrValue ? (
            <View style={styles.qrBody}>
              <View style={styles.qrPoster}>
                <QRCode
                  value={qrValue}
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

              <View style={styles.qrWalletMeta}>
                {walletLabel ? <ThemedText type="defaultSemiBold">{walletLabel}</ThemedText> : null}
                <ThemedText
                  type="bodySmall"
                  lightColor={BrandColors.slate}
                  darkColor={BrandColors.slate}>
                  {wallet?.walletNumber ?? qr?.walletNumber ?? '-'}
                </ThemedText>
              </View>
            </View>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t, language } = useI18n();
  const { user, accessToken, refreshSession } = useSession();
  const { resetFlow } = useTransferFlow();
  const { width: screenWidth } = useWindowDimensions();
  const [activeWalletIndex, setActiveWalletIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [qrWallet, setQrWallet] = useState<WalletDetails | null>(null);
  const [isQrVisible, setIsQrVisible] = useState(false);
  const [personalQr, setPersonalQr] = useState<QrToken | null>(null);
  const [isLoadingPersonalQr, setIsLoadingPersonalQr] = useState(false);
  const [personalQrError, setPersonalQrError] = useState<string | null>(null);
  const { wallets, isLoading: isLoadingWallets, errorMessage: walletErrorMessage, reload: reloadWallets } =
    useHomeWallets();

  const hasMultipleWallets = wallets.length > 1;
  const walletCardWidth = Math.max(
    280,
    hasMultipleWallets ? Math.min(screenWidth - 56, 380) : screenWidth - 32
  );
  const walletSnapInterval = walletCardWidth + 12;

  useEffect(() => {
    setActiveWalletIndex((currentIndex) => {
      if (wallets.length === 0) {
        return 0;
      }

      return Math.min(currentIndex, wallets.length - 1);
    });
  }, [wallets.length]);

  const activeWallet = wallets[activeWalletIndex] ?? null;
  const qrWalletLabel = qrWallet ? getWalletTypeLabel(qrWallet.walletType, t) : null;

  const actions = ACTIONS.map((item) => ({
    ...item,
    label: t(item.labelKey),
  }));
  const {
    transactions: recentTransactions,
    isLoading: isLoadingTransactions,
    errorMessage,
    reload,
  } = useHomeTransactions(activeWallet?.id);
  const isLoading = isLoadingWallets || isLoadingTransactions;
  const transactions = useMemo(
    () => recentTransactions.map((transaction) => presentTransaction(transaction, t, language)),
    [language, recentTransactions, t]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await Promise.allSettled([reloadWallets(), reload()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [reload, reloadWallets]);

  const handleWalletScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!hasMultipleWallets) {
      return;
    }

    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / walletSnapInterval);
    setActiveWalletIndex(Math.max(0, Math.min(nextIndex, wallets.length - 1)));
  };

  const loadPersonalQr = useCallback(
    async (wallet: WalletDetails) => {
      if (wallet.walletType !== 'PERSONAL' || !accessToken) {
        return;
      }

      setIsQrVisible(true);
      setQrWallet(wallet);
      setPersonalQrError(null);
      setIsLoadingPersonalQr(true);

      const requestQr = async (token: string) => qrApi.getPersonal(token);

      try {
        const response = await requestQr(accessToken);
        setPersonalQr(response);
      } catch (error) {
        const shouldRetry = isApiError(error) && error.status === 401;

        if (shouldRetry) {
          try {
            const refreshed = await refreshSession();

            if (refreshed?.accessToken) {
              const response = await requestQr(refreshed.accessToken);
              setPersonalQr(response);
              setPersonalQrError(null);
              return;
            }
          } catch {
            // Fall through to the user-facing error below.
          }
        }

        setPersonalQr(null);
        setPersonalQrError(t('home.wallets.qr.loadError'));
      } finally {
        setIsLoadingPersonalQr(false);
      }
    },
    [accessToken, refreshSession, t]
  );

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <AppTopBar
        backgroundColor={palette.background}
        surfaceColor={palette.surface}
        borderColor={palette.border}
        textMutedColor={palette.textMuted}
        textColor={palette.text}
        eyebrow={t('home.header.eyebrow')}
        displayName={user?.displayName?.trim() || Brand.name}
        onProfilePress={() => router.push('/(tabs)/profile')}
        onActionPress={() => router.push('/(tabs)/transactions')}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={palette.tint}
            colors={[palette.tint]}
          />
        }>
        {isLoadingWallets ? (
          <View style={[styles.walletCard, styles.walletStateCard, BrandShadow.card]}>
            <ThemedText
              type="bodySmall"
              style={styles.walletStateText}
              lightColor="rgba(255,255,255,0.76)"
              darkColor="rgba(255,255,255,0.76)">
              {t('home.wallets.messages.loading')}
            </ThemedText>
          </View>
        ) : walletErrorMessage ? (
          <View style={[styles.walletCard, styles.walletStateCard, BrandShadow.card]}>
            <ThemedText
              type="bodySmall"
              style={styles.walletStateText}
              lightColor="rgba(255,255,255,0.76)"
              darkColor="rgba(255,255,255,0.76)">
              {walletErrorMessage}
            </ThemedText>
            <Pressable onPress={() => void reloadWallets()} hitSlop={8}>
              <ThemedText type="link" lightColor={BrandColors.white} darkColor={BrandColors.white}>
                {t('home.wallets.retry')}
              </ThemedText>
            </Pressable>
          </View>
        ) : wallets.length === 0 ? (
          <View style={[styles.walletCard, styles.walletStateCard, BrandShadow.card]}>
            <ThemedText
              type="bodySmall"
              style={styles.walletStateText}
              lightColor="rgba(255,255,255,0.76)"
              darkColor="rgba(255,255,255,0.76)">
              {t('home.wallets.empty')}
            </ThemedText>
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={hasMultipleWallets}
              pagingEnabled={false}
              snapToInterval={hasMultipleWallets ? walletSnapInterval : undefined}
              decelerationRate={hasMultipleWallets ? 'fast' : 'normal'}
              snapToAlignment="start"
              contentContainerStyle={styles.walletCarouselContent}
              onMomentumScrollEnd={handleWalletScrollEnd}>
              {wallets.map((wallet) => (
                <View key={wallet.id} style={[styles.walletCard, { width: walletCardWidth }, BrandShadow.card]}>
                  <View style={styles.walletGlowPrimary} />
                  <View style={styles.walletGlowSecondary} />
                  <View style={styles.walletPattern}>
                    {CARD_PATTERN_DOTS.map((dot) => (
                      <View
                        key={`${wallet.id}-${dot.key}`}
                        style={[
                          styles.walletPatternDot,
                          {
                            top: dot.top,
                            left: dot.left,
                            opacity: dot.opacity,
                          },
                        ]}
                      />
                    ))}
                  </View>

                  <View style={styles.walletHeader}>
                    <View style={styles.walletBrandRow}>
                      <Image
                        source={require('../../assets/brand/yebapay-wordmark.png')}
                        style={styles.walletWordmark}
                        contentFit="contain"
                      />
                    </View>

                    <View style={styles.walletTypeBadge}>
                      <ThemedText
                        type="bodySmall"
                        lightColor="rgba(255,255,255,0.84)"
                        darkColor="rgba(255,255,255,0.84)">
                        {getWalletTypeLabel(wallet.walletType, t)}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.walletBalanceBlock}>
                    <ThemedText
                      type="bodySmall"
                      lightColor="rgba(255,255,255,0.72)"
                      darkColor="rgba(255,255,255,0.72)">
                      {t('common.available')}
                    </ThemedText>
                    <ThemedText
                      type="balance"
                      style={styles.walletBalance}
                      lightColor={BrandColors.white}
                      darkColor={BrandColors.white}>
                      {formatWalletBalance(wallet, language)}
                    </ThemedText>
                  </View>

                  <View style={styles.walletFooter}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={styles.walletNumber}
                      lightColor="rgba(255,255,255,0.72)"
                      darkColor="rgba(255,255,255,0.72)">
                      {maskWalletNumber(wallet.walletNumber)}
                    </ThemedText>

                    <Pressable
                      onPress={() => void loadPersonalQr(wallet)}
                      disabled={wallet.walletType !== 'PERSONAL'}
                      hitSlop={8}
                      style={[
                        styles.walletSignaturePressable,
                        wallet.walletType !== 'PERSONAL' ? styles.walletSignatureDisabled : null,
                      ]}>
                      <View style={styles.walletSignature}>
                        <View style={[styles.walletSignatureCorner, styles.walletSignatureCornerTopLeft]} />
                        <View style={[styles.walletSignatureCorner, styles.walletSignatureCornerTopRight]} />
                        <View style={[styles.walletSignatureCorner, styles.walletSignatureCornerBottomLeft]} />
                        <View style={[styles.walletSignatureCorner, styles.walletSignatureCornerBottomRight]} />
                        <View style={styles.walletSignatureCore} />
                      </View>
                    </Pressable>
                  </View>
                </View>
              ))}
            </ScrollView>

            {hasMultipleWallets ? (
              <View style={styles.indicators}>
                {wallets.map((wallet, index) => (
                  <View
                    key={wallet.id}
                    style={index === activeWalletIndex ? styles.indicatorActive : styles.indicatorInactive}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}

        <View style={styles.actionsRow}>
          {actions.map((action) => (
            <Pressable
              key={action.labelKey}
              onPress={() => {
                if (action.route) {
                  if (action.route === '/transfer/recipient') {
                    resetFlow();
                  }
                  router.push(action.route);
                }
              }}
              style={styles.actionItem}>
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      styles.actionIconWrap,
                      {
                        backgroundColor: BrandColors.white,
                        borderColor: pressed ? palette.tint : palette.border,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                        opacity: pressed ? 0.95 : 1,
                      },
                      BrandShadow.card,
                    ]}>
                    <MaterialIcons name={action.icon} size={24} color={palette.tint} />
                  </View>
                  <ThemedText type="bodySmall" style={styles.actionLabel}>
                    {action.label}
                  </ThemedText>
                </>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">{t('home.transactions.title')}</ThemedText>
          <Pressable onPress={() => router.push('/(tabs)/transactions')} hitSlop={8}>
            <ThemedText
              type="bodySmall"
              lightColor={palette.tint}
              darkColor={palette.tint}
              style={styles.seeAllText}>
              {t('home.transactions.seeAll')}
            </ThemedText>
          </Pressable>
        </View>

        {isLoading ? (
          <View
            style={[
              styles.transactionStateCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
              BrandShadow.card,
            ]}>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {t('home.transactions.messages.loading')}
            </ThemedText>
          </View>
        ) : errorMessage ? (
          <View
            style={[
              styles.transactionStateCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
              BrandShadow.card,
            ]}>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {errorMessage}
            </ThemedText>
            <Pressable onPress={() => void reload()} hitSlop={8}>
              <ThemedText type="link" lightColor={palette.tint} darkColor={palette.tint}>
                {t('home.transactions.retry')}
              </ThemedText>
            </Pressable>
          </View>
        ) : transactions.length === 0 ? (
          <View
            style={[
              styles.transactionStateCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
              BrandShadow.card,
            ]}>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {t('home.transactions.empty')}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.transactionsCard}>
            {transactions.map((item) => {
              const amountColor = item.kind === 'credit' ? palette.success : palette.danger;
              const dotColor = item.kind === 'credit' ? palette.success : palette.warning;
              const avatarBackground =
                item.kind === 'credit' ? 'rgba(30, 107, 91, 0.10)' : 'rgba(215, 154, 43, 0.12)';

              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(`/transactions/${item.id}`)}
                  style={[
                    styles.transactionItemCard,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                    BrandShadow.card,
                  ]}>
                  <View style={styles.transactionRow}>
                    <View style={[styles.transactionAvatar, { backgroundColor: avatarBackground }]}>
                      <MaterialIcons name={item.icon} size={20} color={palette.text} />
                    </View>

                    <View style={styles.transactionCopy}>
                      <ThemedText type="defaultSemiBold" numberOfLines={1}>
                        {item.title}
                      </ThemedText>
                      <View style={styles.transactionMeta}>
                        <View style={[styles.transactionMetaDot, { backgroundColor: dotColor }]} />
                        <ThemedText
                          type="bodySmall"
                          numberOfLines={1}
                          lightColor={palette.textMuted}
                          darkColor={palette.textMuted}>
                          {item.subtitle}
                        </ThemedText>
                      </View>
                    </View>

                    <View style={styles.transactionAmountWrap}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={styles.transactionAmount}
                        lightColor={amountColor}
                        darkColor={amountColor}>
                        {item.amount}
                      </ThemedText>
                      <ThemedText
                        type="bodySmall"
                        style={styles.transactionTime}
                        lightColor={palette.textMuted}
                        darkColor={palette.textMuted}>
                        {item.time}
                      </ThemedText>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <WalletQrModal
        visible={isQrVisible}
        wallet={qrWallet}
        walletLabel={qrWalletLabel}
        qr={personalQr}
        isLoading={isLoadingPersonalQr}
        errorMessage={personalQrError}
        title={t('home.wallets.qr.title')}
        onClose={() => {
          setIsQrVisible(false);
          setPersonalQrError(null);
        }}
        onRetry={() => {
          if (qrWallet) {
            void loadPersonalQr(qrWallet);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 20,
  },
  walletCard: {
    minHeight: 196,
    borderRadius: 28,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    backgroundColor: BrandColors.ink,
  },
  walletCarouselContent: {
    gap: 12,
    paddingRight: 4,
  },
  walletStateCard: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,
  },
  walletStateText: {
    maxWidth: 240,
  },
  walletGlowPrimary: {
    position: 'absolute',
    top: -34,
    right: -28,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(30, 107, 91, 0.48)',
  },
  walletGlowSecondary: {
    position: 'absolute',
    bottom: -52,
    left: -20,
    width: 174,
    height: 174,
    borderRadius: 87,
    backgroundColor: 'rgba(215, 154, 43, 0.18)',
  },
  walletPattern: {
    position: 'absolute',
    top: 24,
    right: 22,
    width: 95,
    height: 50,
  },
  walletPatternDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: BrandColors.white,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletBrandRow: {
    justifyContent: 'center',
    marginLeft: -30,
  },
  walletWordmark: {
    width: 168,
    height: 43,
    opacity: 0.98,
  },
  walletTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  walletBalanceBlock: {
    gap: 6,
  },
  walletBalance: {
    fontSize: 34,
    lineHeight: 38,
  },
  walletFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletNumber: {
    letterSpacing: 1.5,
  },
  walletSignature: {
    width: 44,
    height: 30,
    position: 'relative',
    opacity: 0.92,
  },
  walletSignaturePressable: {
    borderRadius: 12,
  },
  walletSignatureDisabled: {
    opacity: 0.42,
  },
  walletSignatureCorner: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderColor: 'rgba(255,255,255,0.84)',
  },
  walletSignatureCornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 7,
  },
  walletSignatureCornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 7,
  },
  walletSignatureCornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 7,
  },
  walletSignatureCornerBottomRight: {
    right: 0,
    bottom: 0,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 7,
  },
  walletSignatureCore: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 9,
    height: 9,
    marginLeft: -4.5,
    marginTop: -4.5,
    borderRadius: 4.5,
    backgroundColor: BrandColors.sun,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
  },
  indicatorActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.palm,
  },
  indicatorInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D7D4CA',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  actionIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionLabel: {
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    fontWeight: '700',
  },
  transactionsCard: {
    gap: 12,
  },
  transactionStateCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  transactionItemCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 0,
  },
  transactionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionCopy: {
    flex: 1,
    gap: 3,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  transactionMetaDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  transactionAmountWrap: {
    alignItems: 'flex-end',
    gap: 3,
  },
  transactionAmount: {
    textAlign: 'right',
  },
  transactionTime: {
    textAlign: 'right',
  },
  qrOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 21, 19, 0.32)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  qrSheet: {
    borderRadius: 28,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E2EBE5',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 20,
  },
  qrSheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  qrTitle: {
    flex: 1,
  },
  qrCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.cloud,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  qrStateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 18,
  },
  qrBody: {
    alignItems: 'center',
    gap: 14,
  },
  qrPoster: {
    padding: 14,
    borderRadius: 28,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  qrWalletMeta: {
    alignItems: 'center',
    gap: 2,
  },
});

const qrLogo = require('../../assets/brand/yebapay-badge.png');
