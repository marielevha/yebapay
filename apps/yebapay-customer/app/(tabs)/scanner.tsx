import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

function resolveScannerRoute(decoded: DecodedQrResponse) {
  const qrType = decoded.qrType?.trim().toUpperCase();

  if (qrType === 'MONEY_REQUEST' && decoded.moneyRequestRef) {
    return {
      pathname: `/request/${decoded.moneyRequestRef}`,
    };
  }

  if (qrType === 'PERSONAL' && decoded.walletNumber) {
    return {
      pathname: '/transfer/beneficiary-new' as const,
      params: {
        scannedWalletNumber: decoded.walletNumber,
        scannedDisplayName: decoded.beneficiaryDisplayName?.trim() || '',
      },
    };
  }

  return null;
}

export default function ScannerScreen() {
  const { t } = useI18n();
  const { accessToken, refreshSession } = useSession();
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isFocused) {
      setHasScanned(false);
      setIsSubmitting(false);
      setErrorMessage(null);
    }
  }, [isFocused]);

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
        const nextRoute = resolveScannerRoute(decoded);

        if (!nextRoute) {
          setErrorMessage(t('scanner.live.unsupported'));
          return;
        }

        router.push(nextRoute as never);
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
            {t('scanner.live.permission.title')}
          </ThemedText>
          <ThemedText type="default" style={styles.permissionBody} lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
            {t('scanner.live.permission.body')}
          </ThemedText>
          <AuthPrimaryButton label={t('scanner.live.permission.cta')} onPress={() => void requestPermission()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.topBar}>
        <ThemedText type="title">{t('scanner.live.title')}</ThemedText>
        <ThemedText type="bodySmall" lightColor="rgba(255,255,255,0.82)" darkColor="rgba(255,255,255,0.82)">
          {t('scanner.live.body')}
        </ThemedText>
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

          <View style={styles.bottomCard}>
            {isSubmitting ? (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={BrandColors.white} />
                <ThemedText type="bodySmall" lightColor={BrandColors.white} darkColor={BrandColors.white}>
                  {t('scanner.live.loading')}
                </ThemedText>
              </View>
            ) : (
              <ThemedText type="bodySmall" style={styles.bottomCopy} lightColor={BrandColors.white} darkColor={BrandColors.white}>
                {t('scanner.live.hint')}
              </ThemedText>
            )}

            {errorMessage ? (
              <View style={styles.errorCard}>
                <ThemedText type="bodySmall" style={styles.bottomCopy} lightColor={BrandColors.white} darkColor={BrandColors.white}>
                  {errorMessage}
                </ThemedText>
                <Pressable
                  onPress={() => {
                    setErrorMessage(null);
                    setHasScanned(false);
                  }}
                  hitSlop={8}>
                  <ThemedText type="defaultSemiBold" lightColor={BrandColors.white} darkColor={BrandColors.white}>
                    {t('scanner.live.retry')}
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
  permissionCard: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 24,
    borderRadius: 28,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 18,
    justifyContent: 'center',
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BrandColors.palm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTitle: {
    maxWidth: 280,
  },
  permissionBody: {
    lineHeight: 24,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 6,
  },
  cameraWrap: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 21, 19, 0.32)',
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
  bottomCard: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    backgroundColor: 'rgba(10, 16, 14, 0.58)',
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  bottomCopy: {
    textAlign: 'center',
  },
  errorCard: {
    gap: 12,
    alignItems: 'center',
  },
});
