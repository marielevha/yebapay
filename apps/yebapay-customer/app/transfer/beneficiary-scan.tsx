import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';
import { getQrDecodeErrorMessage } from '@/features/qr/qr-errors';
import { qrApi } from '@/features/qr/qr.api';
import type { DecodedQrResponse } from '@/features/qr/qr.types';
import { isApiError } from '@/lib/api/api-error';
import { useI18n } from '@/i18n/provider';
import { useSession } from '@/providers/session-provider';

function resolveScannedBeneficiary(decoded: DecodedQrResponse) {
  const qrType = decoded.qrType?.trim().toUpperCase();

  if (qrType !== 'PERSONAL' || !decoded.walletNumber) {
    return null;
  }

  return {
    walletNumber: decoded.walletNumber,
    displayName: decoded.beneficiaryDisplayName?.trim() || '',
  };
}

export default function TransferBeneficiaryScanScreen() {
  const { t } = useI18n();
  const { accessToken, refreshSession } = useSession();
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const decodeWithSession = useCallback(
    async (qrData: string) => {
      try {
        return await qrApi.decode({ qrData }, accessToken ?? undefined);
      } catch (error) {
        const shouldRetry = isApiError(error) && error.status === 401;

        if (shouldRetry) {
          const refreshed = await refreshSession();

          if (refreshed?.accessToken) {
            return qrApi.decode({ qrData }, refreshed.accessToken);
          }
        }

        throw error;
      }
    },
    [accessToken, refreshSession]
  );

  const handleBarcodeScanned = useCallback(
    async ({ data }: { data: string }) => {
      if (!data || isSubmitting || hasScanned) {
        return;
      }

      setHasScanned(true);
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
        const decoded = await decodeWithSession(data);
        const beneficiary = resolveScannedBeneficiary(decoded);

        if (!beneficiary) {
          setErrorMessage(t('transfer.qr.errors.unsupported'));
          return;
        }

        router.replace({
          pathname: '/transfer/beneficiary-new',
          params: {
            scannedWalletNumber: beneficiary.walletNumber,
            scannedDisplayName: beneficiary.displayName,
          },
        });
      } catch (error) {
        setErrorMessage(getQrDecodeErrorMessage(error, t));
      } finally {
        setIsSubmitting(false);
      }
    },
    [decodeWithSession, hasScanned, isSubmitting, t]
  );

  if (!permission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator color={BrandColors.palm} />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.permissionCard}>
          <View style={styles.iconBadge}>
            <ThemedText type="subtitle" lightColor={BrandColors.white} darkColor={BrandColors.white}>
              QR
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.permissionTitle}>
            {t('transfer.qr.permission.title')}
          </ThemedText>
          <ThemedText type="default" style={styles.permissionBody} lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
            {t('transfer.qr.permission.body')}
          </ThemedText>
          <AuthPrimaryButton label={t('transfer.qr.permission.cta')} onPress={() => void requestPermission()} />
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ThemedText type="link" lightColor={BrandColors.palm} darkColor={BrandColors.palm}>
              {t('transfer.qr.close')}
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.navButton} hitSlop={8}>
          <ThemedText type="defaultSemiBold">{t('transfer.qr.close')}</ThemedText>
        </Pressable>
      </View>

      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>

          <View style={styles.copyCard}>
            <ThemedText type="sectionTitle" lightColor={BrandColors.white} darkColor={BrandColors.white}>
              {t('transfer.qr.title')}
            </ThemedText>
            <ThemedText type="bodySmall" style={styles.centeredText} lightColor="rgba(255,255,255,0.86)" darkColor="rgba(255,255,255,0.86)">
              {t('transfer.qr.body')}
            </ThemedText>

            {isSubmitting ? (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={BrandColors.white} />
                <ThemedText type="bodySmall" lightColor={BrandColors.white} darkColor={BrandColors.white}>
                  {t('transfer.qr.loading')}
                </ThemedText>
              </View>
            ) : null}

            {errorMessage ? (
              <View style={styles.errorCard}>
                <ThemedText type="bodySmall" style={styles.centeredText} lightColor={BrandColors.white} darkColor={BrandColors.white}>
                  {errorMessage}
                </ThemedText>
                <Pressable
                  onPress={() => {
                    setErrorMessage(null);
                    setHasScanned(false);
                  }}
                  hitSlop={8}>
                  <ThemedText type="defaultSemiBold" lightColor={BrandColors.white} darkColor={BrandColors.white}>
                    {t('transfer.qr.retry')}
                  </ThemedText>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.black,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  navButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cameraWrap: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 21, 19, 0.28)',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },
  scanFrame: {
    alignSelf: 'center',
    width: 248,
    height: 248,
    borderRadius: 28,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderColor: BrandColors.white,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 22,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 22,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 22,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 22,
  },
  copyCard: {
    borderRadius: 24,
    backgroundColor: 'rgba(18, 49, 46, 0.78)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
  },
  centeredText: {
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  errorCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(216, 92, 52, 0.72)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 10,
  },
  permissionCard: {
    flex: 1,
    margin: 20,
    borderRadius: 28,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconBadge: {
    width: 70,
    height: 70,
    borderRadius: 24,
    backgroundColor: BrandColors.palm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    textAlign: 'center',
  },
  permissionBody: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
