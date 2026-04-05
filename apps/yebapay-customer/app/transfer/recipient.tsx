import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
import { useBeneficiaries } from '@/features/beneficiaries/use-beneficiaries';
import { useTransferFlow } from '@/features/transfer/transfer-flow-provider';
import { useI18n } from '@/i18n/provider';

function getInitials(displayName: string) {
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || 'Y';
}

function rankBeneficiaries(
  beneficiaries: {
    id: string;
    lastUsedAt: string | null;
  }[]
) {
  return [...beneficiaries].sort((left, right) => {
    const leftTime = left.lastUsedAt ? new Date(left.lastUsedAt).getTime() : 0;
    const rightTime = right.lastUsedAt ? new Date(right.lastUsedAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

export default function TransferRecipientScreen() {
  const { t } = useI18n();
  const { setDestinationWalletNumber } = useTransferFlow();
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const { beneficiaries, isLoading, errorMessage, reload } = useBeneficiaries(deferredSearchQuery);

  const rankedBeneficiaries = useMemo(() => rankBeneficiaries(beneficiaries), [beneficiaries]);
  const recentBeneficiaries = useMemo(() => rankedBeneficiaries.slice(0, 6), [rankedBeneficiaries]);

  const selectBeneficiary = (walletNumber: string, displayName: string) => {
    setDestinationWalletNumber(walletNumber, displayName);
    router.push('/transfer/amount');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.backgroundGlow} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={[styles.navButton, BrandShadow.card]} hitSlop={8}>
            <MaterialIcons name="arrow-back-ios-new" size={18} color={BrandColors.ink} />
          </Pressable>

          <View style={styles.headerBrand}>
            <View style={styles.brandBadge}>
              <BrandMark size={28} />
            </View>
            <ThemedText type="defaultSemiBold">YebaPay</ThemedText>
          </View>

          <View style={styles.navGhost} />
        </View>

        <View style={styles.copy}>
          <ThemedText type="eyebrow" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
            {t('transfer.steps.recipient')}
          </ThemedText>
          <ThemedText type="title" style={styles.title}>
            {t('transfer.recipient.title')}
          </ThemedText>
          <ThemedText
            type="default"
            style={styles.subtitle}
            lightColor={BrandColors.slate}
            darkColor={BrandColors.slate}>
            {t('transfer.recipient.subtitle')}
          </ThemedText>
        </View>

        <View style={styles.searchShell}>
          <MaterialIcons name="search" size={20} color={searchQuery ? BrandColors.palm : '#9AA9A4'} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('transfer.recipient.searchPlaceholder')}
            placeholderTextColor="#9AA9A4"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />

          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8} style={styles.clearButton}>
              <MaterialIcons name="close" size={16} color={BrandColors.slate} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold">{t('transfer.recipient.recentTitle')}</ThemedText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentRow}>
          <Pressable
            onPress={() => router.push('/transfer/beneficiary-new')}
            style={({ pressed }) => [
              styles.recentItem,
              pressed ? styles.recentItemPressed : undefined,
            ]}>
            <View style={[styles.recentAvatar, styles.addAvatar]}>
              <MaterialIcons name="add" size={24} color={BrandColors.palm} />
            </View>
            <ThemedText type="bodySmall" style={styles.recentLabel}>
              {t('transfer.recipient.addShort')}
            </ThemedText>
          </Pressable>

          {isLoading ? (
            <View style={styles.recentLoading}>
              <ActivityIndicator color={BrandColors.palm} />
            </View>
          ) : recentBeneficiaries.map((beneficiary) => (
            <Pressable
              key={beneficiary.id}
              onPress={() => selectBeneficiary(beneficiary.walletNumber, beneficiary.displayName)}
              style={({ pressed }) => [
                styles.recentItem,
                pressed ? styles.recentItemPressed : undefined,
              ]}>
              <View style={styles.recentAvatar}>
                <ThemedText type="defaultSemiBold" lightColor={BrandColors.ink} darkColor={BrandColors.ink}>
                  {getInitials(beneficiary.displayName)}
                </ThemedText>
              </View>
              <ThemedText type="bodySmall" numberOfLines={1} style={styles.recentLabel}>
                {beneficiary.displayName}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold">{t('transfer.recipient.allTitle')}</ThemedText>
        </View>

        <View style={[styles.listCard, BrandShadow.card]}>
          {isLoading ? (
            <View style={styles.stateWrap}>
              <ActivityIndicator color={BrandColors.palm} />
              <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {t('transfer.recipient.loading')}
              </ThemedText>
            </View>
          ) : errorMessage ? (
            <View style={styles.stateWrap}>
              <View style={styles.errorIcon}>
                <MaterialIcons name="wifi-off" size={22} color={BrandColors.clay} />
              </View>
              <ThemedText type="defaultSemiBold">{t('transfer.recipient.errorTitle')}</ThemedText>
              <ThemedText type="bodySmall" style={styles.centerText} lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {errorMessage}
              </ThemedText>
              <Pressable onPress={() => void reload()} hitSlop={8}>
                <ThemedText type="link" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
                  {t('transfer.recipient.retry')}
                </ThemedText>
              </Pressable>
            </View>
          ) : beneficiaries.length === 0 ? (
            <View style={styles.stateWrap}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="group" size={22} color={BrandColors.palm} />
              </View>
              <ThemedText type="defaultSemiBold">{t('transfer.recipient.emptyTitle')}</ThemedText>
              <ThemedText type="bodySmall" style={styles.centerText} lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {deferredSearchQuery.trim()
                  ? t('transfer.recipient.emptyFiltered')
                  : t('transfer.recipient.emptyBody')}
              </ThemedText>
            </View>
          ) : (
            rankedBeneficiaries.map((beneficiary, index) => (
              <Pressable
                key={beneficiary.id}
                onPress={() => selectBeneficiary(beneficiary.walletNumber, beneficiary.displayName)}
                style={({ pressed }) => [
                  styles.listItem,
                  index !== rankedBeneficiaries.length - 1 ? styles.listItemBorder : undefined,
                  pressed ? styles.listItemPressed : undefined,
                ]}>
                <View style={styles.listAvatar}>
                  <ThemedText type="defaultSemiBold" lightColor={BrandColors.ink} darkColor={BrandColors.ink}>
                    {getInitials(beneficiary.displayName)}
                  </ThemedText>
                </View>

                <View style={styles.listCopy}>
                  <ThemedText type="defaultSemiBold" numberOfLines={1}>
                    {beneficiary.displayName}
                  </ThemedText>
                  <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                    {beneficiary.walletNumber}
                  </ThemedText>
                </View>

                <MaterialIcons name="chevron-right" size={20} color={BrandColors.slate} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.cloud,
  },
  backgroundGlow: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#E9EFEC',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 22,
  },
  topBar: {
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  navButton: {
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
  navGhost: {
    width: 44,
  },
  copy: {
    gap: 8,
  },
  title: {
    maxWidth: 320,
  },
  subtitle: {
    maxWidth: 340,
  },
  searchShell: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: '#F4F6F5',
    borderWidth: 1,
    borderColor: '#E4E9E6',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: BrandColors.ink,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E9EFEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    gap: 4,
  },
  recentRow: {
    gap: 18,
    paddingRight: 12,
  },
  recentItem: {
    width: 72,
    alignItems: 'center',
    gap: 8,
  },
  recentItemPressed: {
    opacity: 0.9,
  },
  recentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1E7D8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6DDD0',
  },
  addAvatar: {
    backgroundColor: '#F6EFD8',
  },
  recentLabel: {
    textAlign: 'center',
  },
  recentLoading: {
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCard: {
    borderRadius: 22,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#E4ECE7',
    overflow: 'hidden',
  },
  listItem: {
    minHeight: 82,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2EF',
  },
  listItemPressed: {
    backgroundColor: '#F8FBF9',
  },
  listAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1E7D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listCopy: {
    flex: 1,
    gap: 2,
  },
  stateWrap: {
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 12,
  },
  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(216, 92, 52, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(30, 107, 91, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
});
