import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';

type AuthFormAlertProps = {
  message: string;
  tone?: 'error' | 'info';
};

export function AuthFormAlert({
  message,
  tone = 'error',
}: AuthFormAlertProps) {
  return (
    <View
      style={[
        styles.container,
        tone === 'error' ? styles.errorContainer : styles.infoContainer,
      ]}>
      <ThemedText
        type="bodySmall"
        style={styles.message}
        lightColor={tone === 'error' ? BrandColors.clay : BrandColors.palm}
        darkColor={tone === 'error' ? BrandColors.clay : BrandColors.palm}>
        {message}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorContainer: {
    backgroundColor: 'rgba(216, 92, 52, 0.08)',
  },
  infoContainer: {
    backgroundColor: 'rgba(30, 107, 91, 0.08)',
  },
  message: {
    lineHeight: 18,
  },
});
