import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Brand, BrandColors } from '@/constants/brand';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandMark } from '@/components/brand-mark';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <BrandMark size={72} />
      <ThemedText type="title" style={styles.title}>
        {Brand.name}
      </ThemedText>
      <ThemedText style={styles.body}>{Brand.slogan}</ThemedText>
      <Link href="/" dismissTo style={styles.link}>
        <ThemedText type="link" style={styles.linkText}>
          {"Retour a l'accueil"}
        </ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  title: {
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    maxWidth: 280,
  },
  link: {
    paddingVertical: 15,
  },
  linkText: {
    color: BrandColors.palm,
  },
});
