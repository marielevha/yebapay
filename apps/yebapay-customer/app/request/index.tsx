import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AuthField } from '@/components/auth/auth-field';
import { AuthFormAlert } from '@/components/auth/auth-form-alert';
import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { TransferScreenShell } from '@/components/transfer/transfer-screen-shell';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { moneyRequestApi } from '@/features/money-request/money-request.api';
import { getMoneyRequestErrorMessage } from '@/features/money-request/money-request-errors';
import {
  parseTransferAmount,
  sanitizeTransferAmountInput,
  sanitizeTransferDescription,
} from '@/features/transfer/transfer-input';
import { useHomeWallets } from '@/features/wallet/use-home-wallets';
import {
  formatWalletBalance,
  getWalletTypeLabel,
  maskWalletNumber,
} from '@/features/wallet/wallet-presenter';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';
import { isApiError } from '@/lib/api/api-error';
import { useSession } from '@/providers/session-provider';

type SelectionOption = {
  value: string;
  label: string;
  description?: string;
};

function WalletSelectionSheet({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: SelectionOption[];
  selectedValue: string;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetOverlay} onPress={onClose}>
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={[
            styles.sheet,
            {
              backgroundColor: palette.background,
              borderColor: palette.border,
            },
          ]}>
          <View style={styles.sheetHeader}>
            <ThemedText type="sectionTitle">{title}</ThemedText>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={palette.textMuted} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetOptions}>
            {options.map((option) => {
              const isSelected = option.value === selectedValue;

              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  style={[
                    styles.sheetOption,
                    {
                      backgroundColor: isSelected ? palette.surface : 'transparent',
                      borderColor: palette.border,
                    },
                  ]}>
                  <View style={styles.sheetOptionCopy}>
                    <ThemedText type="defaultSemiBold" numberOfLines={1}>
                      {option.label}
                    </ThemedText>
                    {option.description ? (
                      <ThemedText
                        type="bodySmall"
                        numberOfLines={1}
                        lightColor={palette.textMuted}
                        darkColor={palette.textMuted}>
                        {option.description}
                      </ThemedText>
                    ) : null}
                  </View>

                  {isSelected ? <MaterialIcons name="check" size={20} color={palette.tint} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function RequestMoneyCreateScreen() {
  const { t, language } = useI18n();
  const { accessToken, refreshSession, isAuthenticated } = useSession();
  const { wallets, isLoading: isLoadingWallets, errorMessage: walletErrorMessage } = useHomeWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (wallets.length === 0) {
      if (selectedWalletId !== null) {
        setSelectedWalletId(null);
      }
      return;
    }

    if (selectedWalletId === null || !wallets.some((wallet) => wallet.id === selectedWalletId)) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [selectedWalletId, wallets]);

  const selectedWallet = useMemo(
    () => wallets.find((wallet) => wallet.id === selectedWalletId) ?? null,
    [selectedWalletId, wallets]
  );
  const walletOptions = useMemo(
    () =>
      wallets.map((wallet) => ({
        value: wallet.id,
        label: getWalletTypeLabel(wallet.walletType, t),
        description: maskWalletNumber(wallet.walletNumber),
      })),
    [t, wallets]
  );
  const amountValue = useMemo(() => parseTransferAmount(amountInput), [amountInput]);
  const canSubmit = Boolean(isAuthenticated && accessToken && selectedWallet && amountValue !== null);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const handleSubmit = async () => {
    if (!canSubmit || !accessToken || amountValue === null || !selectedWallet || submitting) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const payload = {
      targetWalletId: selectedWallet.id,
      amount: amountValue,
      reason: reason.trim() || undefined,
    };
    const sendRequest = async (token: string) => moneyRequestApi.createCurrentUserMoneyRequest(payload, token);

    try {
      const response = await sendRequest(accessToken);
      router.push(`/request/${response.requestRef}`);
    } catch (error) {
      const shouldRetry = isApiError(error) && error.status === 401;

      if (shouldRetry) {
        try {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            const response = await sendRequest(refreshed.accessToken);
            router.push(`/request/${response.requestRef}`);
            return;
          }
        } catch {
          // Fall through to the user-facing error below.
        }
      }

      setErrorMessage(getMoneyRequestErrorMessage(error, { context: 'create', t }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <TransferScreenShell
      title={t('requestMoney.create.title')}
      onBack={() => router.back()}
      contentSurface="plain"
      topBarVariant="title"
      copyTitleHidden
      footer={
        <AuthPrimaryButton
          label={t('requestMoney.create.submit')}
          loadingLabel={t('requestMoney.create.creating')}
          loading={submitting}
          disabled={!canSubmit}
          onPress={handleSubmit}
        />
      }>
      <View style={styles.content}>
        <View style={styles.walletSection}>
          

          {isLoadingWallets ? (
            <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
              {t('requestMoney.create.receiveWalletLoading')}
            </ThemedText>
          ) : walletErrorMessage ? (
            <ThemedText type="bodySmall" lightColor={BrandColors.clay} darkColor={BrandColors.clay}>
              {walletErrorMessage}
            </ThemedText>
          ) : selectedWallet ? (
            <View style={styles.walletPillWrap}>
              <Pressable
                onPress={() => setWalletSheetOpen(true)}
                style={[styles.walletPill, BrandShadow.card]}>
                <View style={styles.walletPillBrand}>
                  <BrandMark size={20} />
                </View>

                <View style={styles.walletPillCopy}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {getWalletTypeLabel(selectedWallet.walletType, t)}
                  </ThemedText>
                  <ThemedText
                    type="bodySmall"
                    numberOfLines={1}
                    lightColor={BrandColors.slate}
                    darkColor={BrandColors.slate}>
                    {maskWalletNumber(selectedWallet.walletNumber)}
                  </ThemedText>
                </View>

                <MaterialIcons name="expand-more" size={20} color={BrandColors.ink} />
              </Pressable>

              <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {formatWalletBalance(selectedWallet, language)}
              </ThemedText>
            </View>
          ) : (
            <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
              {t('requestMoney.create.receiveWalletEmpty')}
            </ThemedText>
          )}
        </View>

        <View style={styles.amountSection}>
          <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
            {t('requestMoney.create.amountLabel')}
          </ThemedText>

          <View style={styles.amountStage}>
            <TextInput
              value={amountInput}
              onChangeText={(value) => {
                setAmountInput(sanitizeTransferAmountInput(value));
                if (errorMessage) {
                  setErrorMessage(null);
                }
              }}
              keyboardType="decimal-pad"
              placeholder={t('requestMoney.create.amountPlaceholder')}
              placeholderTextColor="#A8B6B1"
              style={styles.amountInput}
              textAlign="center"
            />
            <ThemedText type="subtitle" style={styles.currencyLabel}>
              {selectedWallet?.currencyDisplayCode ?? 'FCFA'}
            </ThemedText>
          </View>
        </View>

        <AuthField
          icon="edit-note"
          placeholder={t('requestMoney.create.reasonPlaceholder')}
          value={reason}
          onChangeText={(value) => {
            setReason(sanitizeTransferDescription(value));
            if (errorMessage) {
              setErrorMessage(null);
            }
          }}
          maxLength={255}
        />

        {errorMessage ? <AuthFormAlert message={errorMessage} /> : null}
      </View>

      <WalletSelectionSheet
        visible={walletSheetOpen}
        title={t('requestMoney.create.receiveWalletLabel')}
        options={walletOptions}
        selectedValue={selectedWalletId ?? ''}
        onClose={() => setWalletSheetOpen(false)}
        onSelect={setSelectedWalletId}
      />
    </TransferScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 26,
  },
  walletSection: {
    gap: 12,
  },
  walletPillWrap: {
    alignItems: 'center',
    gap: 10,
  },
  walletPill: {
    maxWidth: 280,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    alignSelf: 'center',
    backgroundColor: BrandColors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#DFE7E1',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  walletPillBrand: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BrandColors.cloud,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletPillCopy: {
    flex: 1,
    gap: 2,
  },
  amountSection: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 6,
  },
  amountStage: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  amountInput: {
    width: '100%',
    color: BrandColors.ink,
    fontSize: 54,
    lineHeight: 60,
    fontWeight: '700',
    paddingVertical: 0,
  },
  currencyLabel: {
    color: BrandColors.slate,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 49, 46, 0.22)',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sheet: {
    borderRadius: 28,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
    maxHeight: '72%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetOptions: {
    gap: 10,
    paddingBottom: 8,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sheetOptionCopy: {
    flex: 1,
    gap: 4,
  },
});
