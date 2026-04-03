import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';

type AuthSuccessStateProps = {
  title: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
};

export function AuthSuccessState({
  title,
  description,
  buttonLabel,
  onPress,
}: AuthSuccessStateProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.glowTop} />
        <View style={styles.glowBottom} />

        <View style={styles.center}>
          <View style={[styles.iconHalo, BrandShadow.card]}>
            <View style={styles.iconCore}>
              <MaterialIcons name="check" size={42} color={BrandColors.white} />
            </View>
          </View>

          <View style={styles.copy}>
            <ThemedText type="title" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText type="default" style={styles.description} lightColor={BrandColors.slate}>
              {description}
            </ThemedText>
          </View>
        </View>

        <Pressable onPress={onPress} style={[styles.button, BrandShadow.card]}>
          <ThemedText type="defaultSemiBold" style={styles.buttonLabel} lightColor={BrandColors.white}>
            {buttonLabel}
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandColors.cloud,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  glowTop: {
    position: 'absolute',
    top: -90,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(30, 107, 91, 0.08)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(244, 232, 209, 0.84)',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 34,
  },
  iconHalo: {
    width: 158,
    height: 158,
    borderRadius: 79,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCore: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: BrandColors.palm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 12,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.palm,
  },
  buttonLabel: {
    textAlign: 'center',
  },
});
