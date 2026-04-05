import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { getTransferErrorMessage } from '@/features/transfer/transfer-errors';
import {
  parseTransferAmount,
  sanitizeTransferAmountInput,
  sanitizeTransferDescription,
} from '@/features/transfer/transfer-input';
import { useTransferFlow } from '@/features/transfer/transfer-flow-provider';
import { useHomeWallets } from '@/features/wallet/use-home-wallets';
import { formatWalletBalance, getWalletTypeLabel, maskWalletNumber } from '@/features/wallet/wallet-presenter';
import { useI18n } from '@/i18n/provider';

const AMOUNT_PATTERN_DOTS = Array.from({ length: 20 }, (_, index) => ({
  key: `amount-dot-${index}`,
  top: Math.floor(index / 5) * 20,
  left: (index % 5) * 20,
  opacity: [0.18, 0.12, 0.24, 0.12, 0.18][index % 5],
}));

function getInitials(displayName: string) {
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'Y';
}

export default function TransferAmountScreen() {
  const { t, language } = useI18n();
  const {
    beneficiaryDisplayName,
    destinationWalletNumber,
    amountInput,
    description,
    quote,
    setAmountInput,
    setDescription,
    requestQuote,
  } = useTransferFlow();
  const { wallets, isLoading: isLoadingWallets, errorMessage: walletErrorMessage } = useHomeWallets();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNoteExpanded, setIsNoteExpanded] = useState(Boolean(description.trim()));
  const noteInputRef = useRef<TextInput | null>(null);
  const requestQuoteRef = useRef(requestQuote);

  const amountValue = useMemo(() => parseTransferAmount(amountInput), [amountInput]);
  const sourceWallet = useMemo(
    () => wallets.find((wallet) => wallet.walletType === 'PERSONAL') ?? wallets[0] ?? null,
    [wallets]
  );
  const recipientName = beneficiaryDisplayName.trim() || t('transfer.amount.recipientFallback');
  const currencyLabel = sourceWallet?.currencyDisplayCode || 'FCFA';
  const hasInsufficientBalance = Boolean(
    sourceWallet && quote && quote.totalDebit > sourceWallet.availableBalance
  );
  const canContinue = amountValue !== null;

  useEffect(() => {
    requestQuoteRef.current = requestQuote;
  }, [requestQuote]);

  useEffect(() => {
    if (isNoteExpanded) {
      const timeout = setTimeout(() => noteInputRef.current?.focus(), 120);
      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isNoteExpanded]);

  useEffect(() => {
    if (!destinationWalletNumber.trim() || amountValue === null) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      void requestQuoteRef.current().catch(() => undefined);
    }, 350);

    return () => clearTimeout(timeout);
  }, [amountValue, destinationWalletNumber]);

  if (!destinationWalletNumber) {
    return <Redirect href="/transfer/recipient" />;
  }

  const handleNoteBlur = () => {
    if (!sanitizeTransferDescription(description)) {
      setIsNoteExpanded(false);
    }
  };

  const handleContinue = async () => {
    if (!canContinue || submitting) {
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    try {
      await requestQuote();
      router.push('/transfer/confirm');
    } catch (error) {
      setErrorMessage(getTransferErrorMessage(error, { context: 'quote', t }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', default: undefined })}
        style={styles.flex}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={[styles.headerAction, BrandShadow.card]}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color={BrandColors.ink} />
          </Pressable>

          <View style={styles.headerBrand}>
            <View style={styles.brandBadge}>
              <BrandMark size={28} />
            </View>
            <ThemedText type="defaultSemiBold">YebaPay</ThemedText>
          </View>

          <View style={styles.headerGhost} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.copy}>
            <ThemedText type="eyebrow" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
              {t('transfer.steps.amount')}
            </ThemedText>
            
          </View>

          <View style={[styles.heroCard, BrandShadow.card]}>
            <Pressable onPress={() => router.back()} style={styles.recipientRow}>
              <View style={styles.avatar}>
                <ThemedText type="defaultSemiBold" lightColor={BrandColors.ink} darkColor={BrandColors.ink}>
                  {getInitials(recipientName)}
                </ThemedText>
              </View>

              <View style={styles.recipientCopy}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {recipientName}
                </ThemedText>
                <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                  {destinationWalletNumber}
                </ThemedText>
              </View>

              <MaterialIcons name="chevron-right" size={20} color={BrandColors.slate} />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.amountPanel}>
              <View style={styles.amountPattern}>
                {AMOUNT_PATTERN_DOTS.map((dot) => (
                  <View
                    key={dot.key}
                    style={[
                      styles.amountPatternDot,
                      {
                        top: dot.top,
                        left: dot.left,
                        opacity: dot.opacity,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.amountSection}>
                <TextInput
                  value={amountInput}
                  onChangeText={(value) => {
                    setAmountInput(sanitizeTransferAmountInput(value));

                    if (errorMessage) {
                      setErrorMessage(null);
                    }
                  }}
                  keyboardType="decimal-pad"
                  placeholder={t('transfer.amount.amountPlaceholder')}
                  placeholderTextColor="#A8B6B1"
                  style={[styles.amountInput, hasInsufficientBalance ? styles.amountInputInsufficient : undefined]}
                  textAlign="center"
                />
                <ThemedText
                  type="subtitle"
                  style={[styles.currencyLabel, hasInsufficientBalance ? styles.currencyLabelInsufficient : undefined]}>
                  {currencyLabel}
                </ThemedText>
              </View>

              <Pressable
                onPress={() => setIsNoteExpanded(true)}
                style={({ pressed }) => [styles.notePill, pressed ? styles.notePillPressed : undefined]}>
                <MaterialIcons name="edit-note" size={18} color={BrandColors.slate} />
                <ThemedText
                  type="bodySmall"
                  numberOfLines={1}
                  lightColor={BrandColors.slate}
                  darkColor={BrandColors.slate}>
                  {description.trim() || t('transfer.amount.addNote')}
                </ThemedText>
              </Pressable>

              {isNoteExpanded ? (
                <View style={styles.noteEditor}>
                  <TextInput
                    ref={noteInputRef}
                    value={description}
                    onChangeText={(value) => {
                      setDescription(sanitizeTransferDescription(value));
                      if (errorMessage) {
                        setErrorMessage(null);
                      }
                    }}
                    onBlur={handleNoteBlur}
                    placeholder={t('transfer.amount.notePlaceholder')}
                    placeholderTextColor="#94A39E"
                    style={styles.noteInput}
                    maxLength={255}
                  />
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.sourceBlock}>
            <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
              {t('transfer.amount.sourceWalletLabel')}
            </ThemedText>

            <View style={[styles.sourceCard, BrandShadow.card]}>
              {isLoadingWallets ? (
                <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                  {t('transfer.amount.sourceWalletLoading')}
                </ThemedText>
              ) : walletErrorMessage ? (
                <ThemedText type="bodySmall" lightColor={BrandColors.clay} darkColor={BrandColors.clay}>
                  {walletErrorMessage}
                </ThemedText>
              ) : sourceWallet ? (
                <View style={styles.sourceRow}>
                  <View style={styles.sourceVisual}>
                    <BrandMark size={20} />
                  </View>

                  <View style={styles.sourceCopy}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {getWalletTypeLabel(sourceWallet.walletType, t)}
                    </ThemedText>
                    <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                      {maskWalletNumber(sourceWallet.walletNumber)}
                    </ThemedText>
                  </View>

                  <ThemedText type="defaultSemiBold">{formatWalletBalance(sourceWallet, language)}</ThemedText>
                </View>
              ) : (
                <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                  {t('transfer.amount.sourceWalletEmpty')}
                </ThemedText>
              )}
            </View>
          </View>

          {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}
        </ScrollView>

        <View style={styles.footer}>
          <AuthPrimaryButton
            label={t('transfer.amount.submit')}
            loadingLabel={t('transfer.status.loadingQuote')}
            loading={submitting}
            disabled={!canContinue}
            onPress={handleContinue}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.cloud,
  },
  flex: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(30, 107, 91, 0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(244, 232, 209, 0.84)',
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DFE9E2',
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E2EBE5',
  },
  headerGhost: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 18,
  },
  copy: {
    gap: 8,
  },
  title: {
    maxWidth: 280,
  },
  heroCard: {
    borderRadius: 28,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E4ECE7',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 18,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(30, 107, 91, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(30, 107, 91, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientCopy: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E7EEE9',
  },
  amountSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 6,
  },
  amountPanel: {
    borderRadius: 26,
    backgroundColor: BrandColors.mist,
    borderWidth: 1,
    borderColor: '#DCE8E2',
    paddingHorizontal: 18,
    paddingVertical: 22,
    alignItems: 'center',
    gap: 14,
    overflow: 'hidden',
  },
  amountPattern: {
    position: 'absolute',
    top: 18,
    left: 26,
    width: 88,
    height: 76,
  },
  amountPatternDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(30, 107, 91, 0.18)',
  },
  amountInput: {
    minWidth: 180,
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '800',
    color: BrandColors.ink,
    paddingVertical: 0,
  },
  amountInputInsufficient: {
    color: BrandColors.clay,
  },
  currencyLabel: {
    color: BrandColors.slate,
  },
  currencyLabelInsufficient: {
    color: BrandColors.clay,
  },
  notePill: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D4E1DB',
    backgroundColor: BrandColors.cloud,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '92%',
  },
  notePillPressed: {
    opacity: 0.9,
  },
  noteEditor: {
    width: '100%',
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4E1DB',
    backgroundColor: BrandColors.cloud,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  noteInput: {
    color: BrandColors.ink,
    fontSize: 15,
    paddingVertical: 0,
  },
  sourceBlock: {
    gap: 8,
  },
  sourceCard: {
    borderRadius: 22,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E4ECE7',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sourceVisual: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 107, 91, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceCopy: {
    flex: 1,
    gap: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
});
