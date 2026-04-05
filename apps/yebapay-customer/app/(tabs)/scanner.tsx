import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, scanFromURLAsync, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthPrimaryButton } from '@/components/auth/auth-primary-button';
import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';
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
      pathname: '/request/review' as const,
      params: {
        requestRef: decoded.moneyRequestRef,
      },
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
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const scanProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      setHasScanned(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setIsErrorModalVisible(false);
      setTorchEnabled(false);
    }
  }, [isFocused]);

  useEffect(() => {
    if (!permission?.granted || !isFocused || isErrorModalVisible) {
      scanProgress.stopAnimation();
      scanProgress.setValue(0);
      return;
    }

    scanProgress.setValue(0);

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanProgress, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(240),
      ])
    );

    loop.start();

    return () => {
      loop.stop();
      scanProgress.stopAnimation();
    };
  }, [isErrorModalVisible, isFocused, permission?.granted, scanProgress]);

  useEffect(() => {
    if (!errorMessage || isErrorModalVisible) {
      return;
    }

    setIsErrorModalVisible(true);
    Alert.alert(
      t('scanner.live.invalidModal.title'),
      t('scanner.live.invalidModal.body'),
      [
        {
          text: 'OK',
          onPress: () => {
            setIsErrorModalVisible(false);
            setErrorMessage(null);
            setHasScanned(false);
          },
        },
      ],
      { cancelable: false }
    );
  }, [errorMessage, isErrorModalVisible, t]);

  const scanLineTranslate = scanProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 204],
  });

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

  const processQrData = useCallback(
    async (qrData: string) => {
      const decoded = await decodeWithSession(qrData);
      const nextRoute = resolveScannerRoute(decoded);

      if (!nextRoute) {
        setErrorMessage(t('scanner.live.unsupported'));
        return;
      }

      router.push(nextRoute as never);
    },
    [decodeWithSession, t]
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
        await processQrData(data);
      } catch (error) {
        setErrorMessage(getQrDecodeErrorMessage(error, t));
      } finally {
        setIsSubmitting(false);
      }
    },
    [hasScanned, isSubmitting, processQrData, t]
  );

  const handlePickFromGallery = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    setErrorMessage(null);
    setHasScanned(true);
    setIsSubmitting(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled || !result.assets[0]?.uri) {
        setHasScanned(false);
        return;
      }

      const barcodes = await scanFromURLAsync(result.assets[0].uri, ['qr']);
      const qrData = typeof barcodes[0]?.data === 'string' ? barcodes[0].data.trim() : '';

      if (!qrData) {
        setErrorMessage(t('scanner.live.unsupported'));
        return;
      }

      await processQrData(qrData);
    } catch (error) {
      setErrorMessage(getQrDecodeErrorMessage(error, t));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, processQrData, t]);

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
      <SafeAreaView style={styles.permissionSafeArea}>
        <View style={styles.permissionScreen}>
          <View style={styles.permissionContent}>
            <View style={[styles.permissionBadge, BrandShadow.card]}>
              <MaterialIcons name="qr-code-scanner" size={34} color={BrandColors.white} />
            </View>
            <ThemedText
              type="title"
              style={styles.permissionTitle}
              lightColor={BrandColors.ink}
              darkColor={BrandColors.ink}>
              {t('scanner.live.permission.title')}
            </ThemedText>
            <ThemedText
              type="default"
              style={styles.permissionBody}
              lightColor={BrandColors.slate}
              darkColor={BrandColors.slate}>
              {t('scanner.live.permission.body')}
            </ThemedText>
            <View style={styles.permissionActionWrap}>
              <AuthPrimaryButton label={t('scanner.live.permission.cta')} onPress={() => void requestPermission()} />
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.cameraWrap}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torchEnabled}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
        />

        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              hitSlop={8}
              style={[styles.topButton, BrandShadow.card]}>
              <MaterialIcons name="arrow-back-ios-new" size={18} color={BrandColors.white} />
            </Pressable>

            <View style={styles.topTitleWrap}>
              <ThemedText
                type="defaultSemiBold"
                style={styles.topTitle}
                lightColor={BrandColors.white}
                darkColor={BrandColors.white}>
                {t('scanner.live.title')}
              </ThemedText>
            </View>

            <View style={styles.topButtonSpacer} />
          </View>

          <View style={styles.scanStage}>
            <View style={styles.scanAuraPrimary} />
            <View style={styles.scanAuraSecondary} />
            <View style={[styles.scanShell, BrandShadow.card]}>
              <View style={styles.scanShellTint} />
              <View style={styles.scanShellInner}>
                <View style={[styles.corner, styles.cornerTopLeft]} />
                <View style={[styles.corner, styles.cornerTopRight]} />
                <View style={[styles.corner, styles.cornerBottomLeft]} />
                <View style={[styles.corner, styles.cornerBottomRight]} />
                {!isErrorModalVisible ? (
                  <Animated.View style={[styles.scanBeamWrap, { transform: [{ translateY: scanLineTranslate }] }]}>
                    <View style={styles.scanBeamGlow} />
                    <View style={styles.scanBeamCore} />
                  </Animated.View>
                ) : null}
              </View>
            </View>

            <View style={styles.hintPill}>
              {isSubmitting ? (
                <View style={styles.statusRow}>
                  <ActivityIndicator size="small" color={BrandColors.white} />
                  <ThemedText type="bodySmall" lightColor={BrandColors.white} darkColor={BrandColors.white}>
                    {t('scanner.live.loading')}
                  </ThemedText>
                </View>
              ) : (
                <ThemedText
                  type="bodySmall"
                  style={styles.bottomCopy}
                  lightColor={BrandColors.white}
                  darkColor={BrandColors.white}>
                  {t('scanner.live.hint')}
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.bottomDock}>
            <View style={styles.actionsRow}>
              <Pressable
                onPress={() => void handlePickFromGallery()}
                hitSlop={8}
                style={[styles.sideActionButton, BrandShadow.card]}>
                <MaterialIcons name="photo-library" size={22} color={BrandColors.white} />
              </Pressable>

              <Pressable
                onPress={() => setTorchEnabled((current) => !current)}
                hitSlop={8}
                style={[
                  styles.sideActionButton,
                  styles.sideActionButtonRight,
                  torchEnabled ? styles.sideActionButtonActive : null,
                  BrandShadow.card,
                ]}>
                <MaterialIcons name={torchEnabled ? 'flash-on' : 'flash-off'} size={22} color={BrandColors.white} />
              </Pressable>
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
    backgroundColor: BrandColors.black,
  },
  permissionSafeArea: {
    flex: 1,
    backgroundColor: BrandColors.cloud,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: BrandColors.cloud,
  },
  permissionContent: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 20,
  },
  permissionBadge: {
    width: 72,
    height: 72,
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
    lineHeight: 25,
  },
  permissionActionWrap: {
    width: '100%',
    marginTop: 6,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 2,
  },
  topButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 49, 46, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  topTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  topButtonSpacer: {
    width: 42,
    height: 42,
  },
  topTitle: {
    textAlign: 'center',
  },
  cameraWrap: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 49, 46, 0.05)',
    justifyContent: 'space-between',
    paddingBottom: 22,
  },
  scanStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 22,
  },
  scanAuraPrimary: {
    position: 'absolute',
    width: 312,
    height: 312,
    borderRadius: 52,
    backgroundColor: 'rgba(30, 107, 91, 0.18)',
  },
  scanAuraSecondary: {
    position: 'absolute',
    width: 276,
    height: 276,
    borderRadius: 46,
    backgroundColor: 'rgba(216, 92, 52, 0.12)',
  },
  scanShell: {
    alignSelf: 'center',
    width: 286,
    height: 286,
    borderRadius: 36,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(250, 250, 247, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.50)',
  },
  scanShellTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(244, 232, 209, 0.18)',
  },
  scanShellInner: {
    flex: 1,
    margin: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.76)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: BrandColors.white,
    zIndex: 3,
  },
  cornerTopLeft: {
    top: 14,
    left: 14,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: 18,
  },
  cornerTopRight: {
    top: 14,
    right: 14,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: 18,
  },
  cornerBottomLeft: {
    bottom: 14,
    left: 14,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: 18,
  },
  cornerBottomRight: {
    bottom: 14,
    right: 14,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: 18,
  },
  scanBeamWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 2,
  },
  scanBeamGlow: {
    width: '100%',
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(30, 107, 91, 0.24)',
  },
  scanBeamCore: {
    position: 'absolute',
    top: 16,
    width: '100%',
    height: 2.5,
    borderRadius: 2,
    backgroundColor: BrandColors.white,
  },
  hintPill: {
    minHeight: 42,
    borderRadius: 21,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 49, 46, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
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
  bottomDock: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  sideActionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(18, 49, 46, 0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  sideActionButtonRight: {
    backgroundColor: 'rgba(18, 49, 46, 0.34)',
  },
  sideActionButtonActive: {
    backgroundColor: 'rgba(216, 92, 52, 0.44)',
  },
});
