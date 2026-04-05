import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import {
  getTransactionTypeFilterOptions,
  presentTransactionHistorySections,
  type PresentedTransactionHistoryItem,
  type PresentedTransactionHistorySection,
} from '@/features/wallet/transaction-history-presenter';
import { useHomeWallets } from '@/features/wallet/use-home-wallets';
import { useInfiniteWalletTransactions } from '@/features/wallet/use-infinite-wallet-transactions';
import { getWalletTypeLabel, maskWalletNumber } from '@/features/wallet/wallet-presenter';
import { TRANSACTION_TYPES, type TransactionType } from '@/features/wallet/wallet.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';

const ALL_WALLETS_FILTER = 'all-wallets';
const ALL_TYPES_FILTER = 'ALL_TYPES';

type SelectionOption = {
  value: string;
  label: string;
  description?: string;
};

function SelectionSheet({
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

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t, language } = useI18n();
  const { wallets, isLoading: isLoadingWallets } = useHomeWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TransactionType | typeof ALL_TYPES_FILTER>(ALL_TYPES_FILTER);
  const [walletSheetOpen, setWalletSheetOpen] = useState(false);
  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (selectedWalletId === null) {
      setSelectedWalletId(wallets[0]?.id ?? ALL_WALLETS_FILTER);
      return;
    }

    if (
      selectedWalletId !== ALL_WALLETS_FILTER &&
      wallets.length > 0 &&
      !wallets.some((wallet) => wallet.id === selectedWalletId)
    ) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [selectedWalletId, wallets]);

  const selectedWalletFilter =
    selectedWalletId && selectedWalletId !== ALL_WALLETS_FILTER ? selectedWalletId : undefined;
  const selectedTypeFilter = selectedType === ALL_TYPES_FILTER ? undefined : selectedType;

  const { transactions, isLoading, isLoadingMore, hasMore, errorMessage, reload, loadNextPage } =
    useInfiniteWalletTransactions(12, {
      walletId: selectedWalletFilter,
      transactionType: selectedTypeFilter,
    });

  const sections = useMemo(
    () => presentTransactionHistorySections(transactions, t, language),
    [language, t, transactions]
  );

  const walletOptions = useMemo(
    () => [
      {
        value: ALL_WALLETS_FILTER,
        label: t('transactionsPage.filters.allWallets'),
        description: t('transactionsPage.list.allWalletsMeta', { count: wallets.length }),
      },
      ...wallets.map((wallet) => ({
        value: wallet.id,
        label: getWalletTypeLabel(wallet.walletType, t),
        description: maskWalletNumber(wallet.walletNumber),
      })),
    ],
    [t, wallets]
  );

  const typeOptions = useMemo(
    () => [
      {
        value: ALL_TYPES_FILTER,
        label: t('transactionsPage.filters.allTypes'),
      },
      ...getTransactionTypeFilterOptions(TRANSACTION_TYPES, t),
    ],
    [t]
  );

  const selectedWallet = wallets.find((wallet) => wallet.id === selectedWalletId);
  const selectedWalletLabel = selectedWallet
    ? getWalletTypeLabel(selectedWallet.walletType, t)
    : t('transactionsPage.filters.allWallets');
  const selectedWalletMeta = selectedWallet
    ? maskWalletNumber(selectedWallet.walletNumber)
    : t('transactionsPage.list.allWalletsMeta', { count: wallets.length });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await reload();
    } finally {
      setIsRefreshing(false);
    }
  }, [reload]);

  const renderTransactionItem = useCallback(
    ({ item }: { item: PresentedTransactionHistoryItem }) => {
      const amountColor = item.kind === 'credit' ? palette.success : palette.danger;
      const avatarBackground =
        item.kind === 'credit' ? 'rgba(30, 107, 91, 0.14)' : 'rgba(18, 49, 46, 0.08)';
      const avatarTextColor = item.kind === 'credit' ? BrandColors.palm : BrandColors.ink;

      return (
        <Pressable
          onPress={() => router.push(`/transactions/${item.id}`)}
          style={[
            styles.transactionCard,
            {
              backgroundColor: palette.surface,
            },
            BrandShadow.card,
          ]}>
          <View style={styles.transactionRow}>
            <View style={[styles.transactionAvatar, { backgroundColor: avatarBackground }]}>
              {item.avatarMode === 'initial' ? (
                <ThemedText
                  type="defaultSemiBold"
                  lightColor={avatarTextColor}
                  darkColor={avatarTextColor}>
                  {item.avatarInitial}
                </ThemedText>
              ) : (
                <MaterialIcons name={item.avatarIcon ?? 'payments'} size={20} color={avatarTextColor} />
              )}
            </View>

            <View style={styles.transactionCopy}>
              <ThemedText type="defaultSemiBold" numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={styles.transactionMeta}>
                <ThemedText
                  type="bodySmall"
                  lightColor={palette.textMuted}
                  darkColor={palette.textMuted}
                  numberOfLines={1}>
                  {item.subtitle}
                </ThemedText>
                <MaterialIcons name={item.metaIcon} size={12} color={palette.textMuted} />
              </View>
            </View>

            <ThemedText
              type="defaultSemiBold"
              lightColor={amountColor}
              darkColor={amountColor}
              style={styles.transactionAmount}>
              {item.amount}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [palette.danger, palette.success, palette.surface, palette.textMuted]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: PresentedTransactionHistorySection }) => (
      <View style={styles.sectionHeader}>
        <ThemedText
          type="bodySmall"
          lightColor={palette.textMuted}
          darkColor={palette.textMuted}
          style={styles.sectionHeaderText}>
          {section.title}
        </ThemedText>
      </View>
    ),
    [palette.textMuted]
  );

  const renderEmptyState = () => {
    if (isLoading || isLoadingWallets) {
      return (
        <View style={[styles.stateCard, { backgroundColor: palette.surface }, BrandShadow.card]}>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('transactionsPage.messages.loading')}
          </ThemedText>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View style={[styles.stateCard, { backgroundColor: palette.surface }, BrandShadow.card]}>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {errorMessage}
          </ThemedText>
          <Pressable onPress={() => void reload()} hitSlop={8}>
            <ThemedText type="link" lightColor={palette.tint} darkColor={palette.tint}>
              {t('transactionsPage.retry')}
            </ThemedText>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={[styles.stateCard, { backgroundColor: palette.surface }, BrandShadow.card]}>
        <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
          {t('transactionsPage.emptyFiltered')}
        </ThemedText>
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerState}>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('transactionsPage.messages.loadingMore')}
          </ThemedText>
        </View>
      );
    }

    if (errorMessage && transactions.length > 0) {
      return (
        <View style={[styles.stateCard, styles.footerCard, { backgroundColor: palette.surface }, BrandShadow.card]}>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {errorMessage}
          </ThemedText>
          <Pressable onPress={() => void loadNextPage()} hitSlop={8}>
            <ThemedText type="link" lightColor={palette.tint} darkColor={palette.tint}>
              {t('transactionsPage.retry')}
            </ThemedText>
          </Pressable>
        </View>
      );
    }

    if (!hasMore && transactions.length > 0) {
      return (
        <View style={styles.footerState}>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('transactionsPage.messages.endReached')}
          </ThemedText>
        </View>
      );
    }

    return <View style={styles.footerSpacer} />;
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      <View style={styles.topBar}>
        <View style={styles.headerGhost} />
        <ThemedText type="defaultSemiBold">{t('transactionsPage.header.title')}</ThemedText>
        <Pressable
          onPress={() => setTypeSheetOpen(true)}
          style={[styles.headerAction, { backgroundColor: palette.surface }, BrandShadow.card]}>
          <MaterialIcons name="tune" size={18} color={palette.text} />
          {selectedType !== ALL_TYPES_FILTER ? <View style={styles.headerActionDot} /> : null}
        </Pressable>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        renderSectionHeader={renderSectionHeader}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void handleRefresh()}
            tintColor={palette.tint}
            colors={[palette.tint]}
            progressViewOffset={8}
          />
        }
        onEndReachedThreshold={0.35}
        onEndReached={() => void loadNextPage()}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.walletPillWrap}>
              <Pressable
                disabled={wallets.length <= 1}
                onPress={() => setWalletSheetOpen(true)}
                style={[
                  styles.walletPill,
                  { backgroundColor: palette.surface },
                  BrandShadow.card,
                ]}>
                <BrandMark size={30} />

                <View style={styles.walletCopy}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {selectedWalletLabel}
                  </ThemedText>
                  <ThemedText
                    type="bodySmall"
                    numberOfLines={1}
                    lightColor={palette.textMuted}
                    darkColor={palette.textMuted}>
                    {selectedWalletMeta}
                  </ThemedText>
                </View>

                {wallets.length > 1 ? (
                  <MaterialIcons name="keyboard-arrow-down" size={20} color={palette.textMuted} />
                ) : null}
              </Pressable>
            </View>
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionSpacer} />}
      />

      <SelectionSheet
        visible={walletSheetOpen}
        title={t('transactionsPage.filters.walletTitle')}
        options={walletOptions}
        selectedValue={selectedWalletId ?? ALL_WALLETS_FILTER}
        onClose={() => setWalletSheetOpen(false)}
        onSelect={(value) => setSelectedWalletId(value)}
      />

      <SelectionSheet
        visible={typeSheetOpen}
        title={t('transactionsPage.filters.typeTitle')}
        options={typeOptions}
        selectedValue={selectedType}
        onClose={() => setTypeSheetOpen(false)}
        onSelect={(value) => setSelectedType(value as TransactionType | typeof ALL_TYPES_FILTER)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  glowLeft: {
    position: 'absolute',
    left: -50,
    top: 80,
    width: 220,
    height: 420,
    borderRadius: 110,
    backgroundColor: 'rgba(30, 107, 91, 0.10)',
  },
  glowRight: {
    position: 'absolute',
    right: -40,
    top: 0,
    width: 220,
    height: 280,
    borderRadius: 110,
    backgroundColor: 'rgba(215, 154, 43, 0.08)',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerBlock: {
    paddingBottom: 12,
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGhost: {
    width: 40,
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.clay,
  },
  walletPillWrap: {
    alignItems: 'center',
    paddingTop: 14,
  },
  walletPill: {
    minHeight: 56,
    maxWidth: 230,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  sectionHeader: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 10,
  },
  sectionHeaderText: {
    textTransform: 'capitalize',
  },
  sectionSpacer: {
    height: 6,
  },
  itemSeparator: {
    height: 12,
  },
  transactionCard: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  transactionAmount: {
    minWidth: 92,
    textAlign: 'right',
  },
  stateCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  footerState: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  footerCard: {
    marginTop: 12,
  },
  footerSpacer: {
    height: 8,
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(14,21,19,0.34)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '72%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  sheetOptions: {
    gap: 8,
    paddingBottom: 12,
  },
  sheetOption: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sheetOptionCopy: {
    flex: 1,
    gap: 2,
  },
});
