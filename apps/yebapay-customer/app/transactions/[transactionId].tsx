import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { Brand, BrandColors, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useTransactionDetails } from '@/features/wallet/use-transaction-details';
import type { TransactionDirection, TransactionStatus } from '@/features/wallet/wallet.types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';

function formatMoney(value: number, currencyDisplayCode: string, language: string) {
  return `${new Intl.NumberFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)} ${currencyDisplayCode}`;
}

function formatDateTime(isoDate: string, language: string) {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoDate));
}

function formatDateParts(isoDate: string, language: string) {
  const locale = language === 'en' ? 'en-US' : 'fr-FR';
  const date = new Date(isoDate);

  return {
    dateLabel: new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(date),
    timeLabel: new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date),
  };
}

function formatWalletHint(walletNumber?: string | null, phoneNumber?: string | null) {
  const trimmedWallet = walletNumber?.trim();
  if (trimmedWallet) {
    return trimmedWallet;
  }

  return phoneNumber?.trim() || '-';
}

function getStatusLabel(status: TransactionStatus, t: (key: string) => string) {
  switch (status) {
    case 'INITIATED':
      return t('transactionsPage.details.statuses.initiated');
    case 'PENDING':
      return t('transactionsPage.details.statuses.pending');
    case 'FAILED':
      return t('transactionsPage.details.statuses.failed');
    case 'EXPIRED':
      return t('transactionsPage.details.statuses.expired');
    case 'CANCELLED':
      return t('transactionsPage.details.statuses.cancelled');
    case 'REFUNDED':
      return t('transactionsPage.details.statuses.refunded');
    case 'COMPLETED':
    default:
      return t('transactionsPage.details.statuses.completed');
  }
}

function getStatusTone(status: TransactionStatus, palette: typeof Colors.light | typeof Colors.dark) {
  switch (status) {
    case 'COMPLETED':
      return palette.success;
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      return palette.danger;
    case 'PENDING':
    case 'INITIATED':
    case 'REFUNDED':
    default:
      return palette.warning;
  }
}

function getTotalRowLabel(direction: TransactionDirection, t: (key: string) => string) {
  return direction === 'OUT'
    ? t('transactionsPage.details.heroAmountLabelOut')
    : t('transactionsPage.details.netAmount');
}

function getShareReceiptTitle(status: TransactionStatus, t: (key: string) => string) {
  switch (status) {
    case 'COMPLETED':
      return t('transactionsPage.details.shareReceiptTitleCompleted');
    case 'FAILED':
    case 'CANCELLED':
    case 'EXPIRED':
      return t('transactionsPage.details.shareReceiptTitleFailed');
    case 'PENDING':
    case 'INITIATED':
    case 'REFUNDED':
      return t('transactionsPage.details.shareReceiptTitlePending');
    default:
      return t('transactionsPage.details.title');
  }
}

function TimelineRow({
  name,
  hint,
  label,
  dateLabel,
  timeLabel,
  isLast = false,
}: {
  name: string;
  hint: string;
  label: string;
  dateLabel: string;
  timeLabel: string;
  isLast?: boolean;
}) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineNodeOuter}>
          <View style={styles.timelineNodeInner} />
        </View>
        {!isLast ? <View style={styles.timelineLine} /> : null}
      </View>

      <View style={styles.timelineCopy}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {name}
        </ThemedText>
        <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
          {hint}
        </ThemedText>
        <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
          {label}
        </ThemedText>
      </View>

      <View style={styles.timelineMeta}>
        <ThemedText
          type="bodySmall"
          lightColor={BrandColors.slate}
          darkColor={BrandColors.slate}
          style={styles.timelineMetaText}
        >
          {dateLabel}
        </ThemedText>
        <ThemedText
          type="bodySmall"
          lightColor={BrandColors.slate}
          darkColor={BrandColors.slate}
          style={styles.timelineMetaText}
        >
          {timeLabel}
        </ThemedText>
      </View>
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

function ShareReceiptLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.shareReceiptLine}>
      <ThemedText
        type="bodySmall"
        lightColor={BrandColors.black}
        darkColor={BrandColors.black}
        style={styles.shareReceiptLineLabel}
      >
        {label}
      </ThemedText>
      <ThemedText
        type="defaultSemiBold"
        lightColor={BrandColors.black}
        darkColor={BrandColors.black}
        style={styles.shareReceiptLineValue}
      >
        {value}
      </ThemedText>
    </View>
  );
}

export default function TransactionDetailsScreen() {
  const { transactionId, backTo } = useLocalSearchParams<{ transactionId?: string; backTo?: string }>();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t, language } = useI18n();
  const shareCaptureRef = useRef<View>(null);
  const [isSharingImage, setIsSharingImage] = useState(false);
  const normalizedTransactionId = typeof transactionId === 'string' ? transactionId : undefined;
  const normalizedBackTo = typeof backTo === 'string' ? backTo : undefined;
  const { transaction, isLoading, errorMessage, reload } = useTransactionDetails(normalizedTransactionId);

  const handleBack = () => {
    if (normalizedBackTo === 'transactions') {
      router.replace('/(tabs)/transactions');
      return;
    }

    router.back();
  };

  if (!normalizedTransactionId) {
    return <Redirect href="/(tabs)/transactions" />;
  }

  if (!isLoading && !transaction && !errorMessage) {
    return <Redirect href="/(tabs)/transactions" />;
  }

  const effectiveDate = transaction?.completedAt ?? transaction?.initiatedAt ?? null;

  if (isLoading || errorMessage || !transaction || !effectiveDate) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            style={[styles.headerAction, styles.headerActionFilled, BrandShadow.card]}
          >
            <MaterialIcons name="arrow-back-ios-new" size={18} color={palette.text} />
          </Pressable>

          <ThemedText type="defaultSemiBold">{t('transactionsPage.details.title')}</ThemedText>

          <View style={styles.headerActionPlaceholder} />
        </View>

        <View style={styles.stateWrap}>
          <View
            style={[
              styles.stateCard,
              { backgroundColor: palette.surface, borderColor: palette.border },
              BrandShadow.card,
            ]}
          >
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {isLoading
                ? t('transactionsPage.details.messages.loading')
                : errorMessage ?? t('transactionsPage.details.messages.genericError')}
            </ThemedText>

            {!isLoading ? (
              <Pressable onPress={() => void reload()} hitSlop={8}>
                <ThemedText type="link" lightColor={palette.tint} darkColor={palette.tint}>
                  {t('transactionsPage.retry')}
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const amountValue = formatMoney(
    transaction.amount,
    transaction.currencyDisplayCode,
    language
  );
  const totalAmount = formatMoney(
    transaction.direction === 'OUT' ? transaction.totalDebit : transaction.netAmount,
    transaction.currencyDisplayCode,
    language
  );
  const statusTone = getStatusTone(transaction.status, palette);
  const statusLabel = getStatusLabel(transaction.status, t);
  const { dateLabel, timeLabel } = formatDateParts(effectiveDate, language);

  const sourceParty = {
    name: transaction.payerDisplayName?.trim() || '-',
    hint: formatWalletHint(transaction.sourceWalletNumber, transaction.payerPhoneNumber),
    label: t('transactionsPage.details.fromLabel'),
  };
  const destinationParty = {
    name: transaction.payeeDisplayName?.trim() || '-',
    hint: formatWalletHint(transaction.destinationWalletNumber, transaction.payeePhoneNumber),
    label: t('transactionsPage.details.toLabel'),
  };
  const shareReceiptTitle = getShareReceiptTitle(transaction.status, t);

  const shareMessage = [
    t('transactionsPage.details.title'),
    `${t('transfer.summary.reference')}: ${transaction.transactionRef}`,
    `${t('transfer.summary.amount')}: ${amountValue}`,
    `${getTotalRowLabel(transaction.direction, t)}: ${totalAmount}`,
    `${t('transactionsPage.details.fromLabel')}: ${sourceParty.name}`,
    `${t('transactionsPage.details.toLabel')}: ${destinationParty.name}`,
    formatDateTime(effectiveDate, language),
  ].join('\n');

  async function handleShareReceipt() {
    if (isSharingImage) {
      return;
    }

    try {
      setIsSharingImage(true);

      const uri = await captureRef(shareCaptureRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: t('transactionsPage.details.share'),
        });
        return;
      }

      await Share.share({
        title: t('transactionsPage.details.title'),
        message: shareMessage,
      });
    } catch {
      await Share.share({
        title: t('transactionsPage.details.title'),
        message: shareMessage,
      });
    } finally {
      setIsSharingImage(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={handleBack}
          hitSlop={8}
          style={[styles.headerAction, styles.headerActionFilled, BrandShadow.card]}
        >
          <MaterialIcons name="arrow-back-ios-new" size={18} color={palette.text} />
        </Pressable>

        <ThemedText type="defaultSemiBold">{t('transactionsPage.details.title')}</ThemedText>

        <View style={styles.headerAction}>
          <MaterialIcons name="info-outline" size={20} color={palette.icon} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pageSections}>
          <View style={styles.hero}>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {t('transfer.summary.amount')}
            </ThemedText>
            <ThemedText type="hero" style={styles.heroAmount}>
              {amountValue}
            </ThemedText>

            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusTone }]} />
              <ThemedText type="bodySmall" lightColor={statusTone} darkColor={statusTone}>
                {statusLabel}
              </ThemedText>
            </View>
          </View>

          <View style={styles.timelineSection}>
            <TimelineRow
              name={sourceParty.name}
              hint={sourceParty.hint}
              label={sourceParty.label}
              dateLabel={dateLabel}
              timeLabel={timeLabel}
            />
            <TimelineRow
              name={destinationParty.name}
              hint={destinationParty.hint}
              label={destinationParty.label}
              dateLabel={dateLabel}
              timeLabel={timeLabel}
              isLast
            />
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.detailsSection}>
            <ThemedText type="sectionTitle">{t('transactionsPage.details.receiptTitle')}</ThemedText>

            <View style={styles.detailList}>
              <DetailRow label={t('transfer.summary.reference')} value={transaction.transactionRef} strong />
              <DetailRow
                label={t('transfer.summary.amount')}
                value={amountValue}
              />
              <DetailRow
                label={t('transfer.summary.fees')}
                value={formatMoney(transaction.feeAmount, transaction.currencyDisplayCode, language)}
              />
              <DetailRow
                label={getTotalRowLabel(transaction.direction, t)}
                value={totalAmount}
                strong
              />
            </View>
          </View>

          {transaction.description?.trim() ? (
            <>
              <View style={styles.sectionDivider} />

              <View style={styles.noteSection}>
                <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                  {t('transfer.summary.description')}
                </ThemedText>

                <View style={styles.noteBox}>
                  <ThemedText type="bodySmall">{transaction.description.trim()}</ThemedText>
                </View>
              </View>
            </>
          ) : null}

          {transaction.failureMessage ? (
            <>
              <View style={styles.sectionDivider} />
              <View style={styles.failureSection}>
                <ThemedText type="bodySmall" lightColor={BrandColors.clay} darkColor={BrandColors.clay}>
                  {t('transactionsPage.details.failureReason')}
                </ThemedText>
                <ThemedText type="bodySmall" lightColor={BrandColors.clay} darkColor={BrandColors.clay}>
                  {transaction.failureMessage}
                </ThemedText>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.footerButton,
            styles.footerButtonSecondary,
            isSharingImage ? styles.footerButtonDisabled : undefined,
          ]}
          onPress={() => void handleShareReceipt()}
          disabled={isSharingImage}
        >
          <MaterialIcons
            name={isSharingImage ? 'hourglass-empty' : 'share'}
            size={18}
            color={palette.text}
          />
          <ThemedText type="defaultSemiBold">
            {t('transactionsPage.details.share')}
          </ThemedText>
        </Pressable>

        <Pressable
          style={[styles.footerButton, styles.footerButtonPrimary]}
          onPress={() => router.push('/transfer/recipient')}
        >
          <MaterialIcons name="arrow-outward" size={18} color={BrandColors.white} />
          <ThemedText
            type="defaultSemiBold"
            lightColor={BrandColors.white}
            darkColor={BrandColors.white}
          >
            {t('transactionsPage.details.transfer')}
          </ThemedText>
        </Pressable>
      </View>

      <View pointerEvents="none" style={styles.shareCaptureHost}>
        <View ref={shareCaptureRef} collapsable={false} style={styles.shareReceiptCanvas}>
          <View style={styles.shareReceiptHeader}>
            <View style={styles.shareReceiptBrand}>
              <BrandMark size={64} />
              <ThemedText
                type="title"
                lightColor={BrandColors.ink}
                darkColor={BrandColors.ink}
                style={styles.shareReceiptBrandName}
              >
                {Brand.name}
              </ThemedText>
            </View>
          </View>

          <View style={styles.shareReceiptAccent} />

          <View style={styles.shareReceiptTitleRow}>
            <ThemedText
              type="title"
              lightColor={BrandColors.palm}
              darkColor={BrandColors.palm}
              style={styles.shareReceiptTitle}
            >
              {shareReceiptTitle}
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              lightColor={BrandColors.black}
              darkColor={BrandColors.black}
              style={styles.shareReceiptDate}
            >
              {formatDateTime(effectiveDate, language)}
            </ThemedText>
          </View>

          <View style={styles.shareReceiptPanel}>
            <View style={styles.shareReceiptCopy}>
              <ShareReceiptLine label={t('transfer.summary.amount')} value={amountValue} />
              <ShareReceiptLine label={t('transactionsPage.details.fromLabel')} value={sourceParty.name} />
              <ShareReceiptLine label={t('transactionsPage.details.toLabel')} value={destinationParty.name} />
              <ShareReceiptLine label="Wallet" value={destinationParty.hint} />
              {transaction.description?.trim() ? (
                <ShareReceiptLine
                  label={t('transfer.summary.description')}
                  value={transaction.description.trim()}
                />
              ) : null}
            </View>

            <View style={styles.shareReceiptVisualWrap}>
              <View style={styles.shareReceiptVisualCircle} />

              <View style={[styles.sharePhone, styles.sharePhoneLeft]}>
                <View style={styles.sharePhoneHeader}>
                  <View style={styles.sharePhoneSpeaker} />
                </View>
                <MaterialIcons name="send" size={64} color={BrandColors.clay} />
                <View style={styles.sharePhonePill}>
                  <ThemedText
                    type="bodySmall"
                    lightColor={BrandColors.white}
                    darkColor={BrandColors.white}
                  >
                    YebaPay
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.sharePhone, styles.sharePhoneRight]}>
                <View style={styles.sharePhoneHeader}>
                  <View style={styles.sharePhoneSpeaker} />
                </View>
                <MaterialIcons name="payments" size={58} color={BrandColors.sun} />
                <View style={styles.shareReceiptCheck}>
                  <MaterialIcons name="check" size={24} color={BrandColors.white} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionFilled: {
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#DFE9E2',
  },
  headerActionPlaceholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 28,
    gap: 18,
  },
  pageSections: {
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
  },
  heroAmount: {
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineSection: {
    gap: 0,
    paddingTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  timelineRail: {
    width: 16,
    alignItems: 'center',
  },
  timelineNodeOuter: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BEE3D5',
    backgroundColor: '#EAF7F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineNodeInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: BrandColors.palm,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    borderRadius: 999,
    backgroundColor: '#BEE3D5',
    minHeight: 48,
  },
  timelineCopy: {
    flex: 1,
    gap: 2,
  },
  timelineMeta: {
    alignItems: 'flex-end',
    gap: 2,
  },
  timelineMetaText: {
    textAlign: 'right',
  },
  sectionDivider: {
    borderTopWidth: 1,
    borderTopColor: '#DCE6E0',
    borderStyle: 'dashed',
  },
  detailsSection: {
    gap: 14,
    paddingTop: 2,
  },
  detailList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailLeader: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#E6ECE8',
    borderStyle: 'dashed',
  },
  noteSection: {
    gap: 10,
    paddingTop: 2,
  },
  noteBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E3EBE7',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  failureSection: {
    gap: 6,
    paddingTop: 2,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  footerButton: {
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  footerButtonSecondary: {
    flex: 1,
    backgroundColor: BrandColors.white,
    borderWidth: 1,
    borderColor: '#DFE9E2',
  },
  footerButtonPrimary: {
    flex: 1.2,
    backgroundColor: BrandColors.ink,
  },
  footerButtonDisabled: {
    opacity: 0.6,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stateCard: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  shareCaptureHost: {
    position: 'absolute',
    left: -1600,
    top: 0,
  },
  shareReceiptCanvas: {
    width: 1240,
    backgroundColor: BrandColors.white,
    paddingBottom: 64,
  },
  shareReceiptHeader: {
    height: 180,
    backgroundColor: '#F6F8F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareReceiptBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  shareReceiptBrandName: {
    fontSize: 42,
    lineHeight: 48,
  },
  shareReceiptAccent: {
    height: 4,
    backgroundColor: BrandColors.palm,
  },
  shareReceiptTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 24,
    paddingHorizontal: 36,
    paddingTop: 34,
    paddingBottom: 28,
  },
  shareReceiptTitle: {
    flex: 1,
    fontSize: 46,
    lineHeight: 54,
  },
  shareReceiptDate: {
    maxWidth: 360,
    textAlign: 'right',
    fontSize: 24,
    lineHeight: 32,
  },
  shareReceiptPanel: {
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D8E3DD',
    backgroundColor: BrandColors.white,
    paddingHorizontal: 28,
    paddingVertical: 34,
    flexDirection: 'row',
    gap: 24,
    minHeight: 470,
  },
  shareReceiptCopy: {
    flex: 1,
    gap: 26,
    justifyContent: 'center',
  },
  shareReceiptLine: {
    gap: 6,
  },
  shareReceiptLineLabel: {
    fontSize: 20,
    lineHeight: 28,
  },
  shareReceiptLineValue: {
    fontSize: 24,
    lineHeight: 32,
  },
  shareReceiptVisualWrap: {
    width: 330,
    minHeight: 340,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shareReceiptVisualCircle: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: '#DFF3EF',
  },
  sharePhone: {
    position: 'absolute',
    width: 128,
    height: 240,
    borderRadius: 24,
    borderWidth: 4,
    borderColor: BrandColors.ink,
    backgroundColor: BrandColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sharePhoneLeft: {
    left: 52,
    bottom: 34,
  },
  sharePhoneRight: {
    right: 28,
    top: 46,
  },
  sharePhoneHeader: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  sharePhoneSpeaker: {
    width: 34,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CAD8D3',
  },
  sharePhonePill: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: BrandColors.clay,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  shareReceiptCheck: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.palm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
