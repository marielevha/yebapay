import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';

type AuthPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

export function AuthPrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel,
}: AuthPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        BrandShadow.card,
        isDisabled ? styles.buttonDisabled : undefined,
        pressed && !isDisabled ? styles.buttonPressed : undefined,
      ]}>
      <View style={styles.content}>
        {loading ? <ActivityIndicator size="small" color={BrandColors.white} /> : null}
        <ThemedText type="defaultSemiBold" style={styles.label} lightColor={BrandColors.white}>
          {loading ? (loadingLabel ?? label) : label}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.palm,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    textAlign: 'center',
  },
});
