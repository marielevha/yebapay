import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilterSelect } from '@/components/filters/filter-select';
import { AppTopBar } from '@/components/navigation/app-top-bar';
import { ThemedText } from '@/components/themed-text';
import { Brand, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import {
  getTransactionTypeLabel,
  presentTransaction,
  type PresentedTransaction,
} from '@/features/wallet/transaction-presenter';
import { useHomeWallets } from '@/features/wallet/use-home-wallets';
import { useInfiniteWalletTransactions } from '@/features/wallet/use-infinite-wallet-transactions';
import { getWalletTypeLabel, maskWalletNumber } from '@/features/wallet/wallet-presenter';
import { TRANSACTION_TYPES, type TransactionType } from '@/features/wallet/wallet.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';
import { useSession } from '@/providers/session-provider';

const ALL_WALLETS_FILTER = 'all-wallets';
const ALL_TYPES_FILTER = 'ALL_TYPES';

export default function TransactionsScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t, language } = useI18n();
  const { user } = useSession();
  const { wallets } = useHomeWallets();
  const [selectedWalletId, setSelectedWalletId] = useState<string>(ALL_WALLETS_FILTER);
  const [selectedType, setSelectedType] = useState<TransactionType | typeof ALL_TYPES_FILTER>(ALL_TYPES_FILTER);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedWalletFilter = selectedWalletId === ALL_WALLETS_FILTER ? undefined : selectedWalletId;
  const selectedTypeFilter = selectedType === ALL_TYPES_FILTER ? undefined : selectedType;
  const { transactions, isLoading, isLoadingMore, hasMore, errorMessage, reload, loadNextPage } =
    useInfiniteWalletTransactions(10, {
      walletId: selectedWalletFilter,
      transactionType: selectedTypeFilter,
    });

  const presentedTransactions = useMemo(
    () => transactions.map((transaction) => presentTransaction(transaction, t, language)),
    [language, t, transactions]
  );

  const walletOptions = useMemo(
    () => [
      {
        value: ALL_WALLETS_FILTER,
        label: t('transactionsPage.filters.allWallets'),
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
      ...TRANSACTION_TYPES.map((transactionType) => ({
        value: transactionType,
        label: getTransactionTypeLabel(transactionType, t),
      })),
    ],
    [t]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await reload();
    } finally {
      setIsRefreshing(false);
    }
  }, [reload]);

  const renderTransaction = ({ item }: { item: PresentedTransaction }) => {
    const amountColor = item.kind === 'credit' ? palette.success : palette.danger;
    const dotColor = item.kind === 'credit' ? palette.success : palette.warning;
    const avatarBackground = item.kind === 'credit' ? 'rgba(30, 107, 91, 0.10)' : 'rgba(215, 154, 43, 0.12)';

    return (
      <Pressable
        onPress={() => router.push(`/transactions/${item.id}`)}
        style={[
          styles.transactionCard,
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
  };

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View
          style={[
            styles.stateCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            BrandShadow.card,
          ]}>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('transactionsPage.messages.loading')}
          </ThemedText>
        </View>
      );
    }

    if (errorMessage) {
      return (
        <View
          style={[
            styles.stateCard,
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
              {t('transactionsPage.retry')}
            </ThemedText>
          </Pressable>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.stateCard,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
          BrandShadow.card,
        ]}>
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
        <View
          style={[
            styles.stateCard,
            styles.footerCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            BrandShadow.card,
          ]}>
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
      <AppTopBar
        backgroundColor={palette.background}
        surfaceColor={palette.surface}
        borderColor={palette.border}
        textMutedColor={palette.textMuted}
        textColor={palette.text}
        eyebrow={t('transactionsPage.topBar.eyebrow')}
        displayName={user?.displayName?.trim() || Brand.name}
        onProfilePress={() => router.push('/(tabs)/profile')}
        onActionPress={() => router.push('/(tabs)/transactions')}
      />

      <FlatList
        data={presentedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
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
          <View style={styles.filtersToolbar}>
            {wallets.length > 1 ? (
              <FilterSelect
                label={t('transactionsPage.filters.walletLabel')}
                title={t('transactionsPage.filters.walletTitle')}
                selectedValue={selectedWalletId}
                options={walletOptions}
                onChange={setSelectedWalletId}
                icon="account-balance-wallet"
              />
            ) : null}

            <FilterSelect
              label={t('transactionsPage.filters.typeLabel')}
              title={t('transactionsPage.filters.typeTitle')}
              selectedValue={selectedType}
              options={typeOptions}
              onChange={(value) => setSelectedType(value as TransactionType | typeof ALL_TYPES_FILTER)}
              icon="tune"
              fullWidth={wallets.length <= 1}
            />
          </View>
        }
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
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
  },
  filtersToolbar: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  itemSeparator: {
    height: 12,
  },
  stateCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  transactionCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
    maxWidth: 112,
  },
  transactionAmount: {
    textAlign: 'right',
  },
  transactionTime: {
    textAlign: 'right',
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
});
