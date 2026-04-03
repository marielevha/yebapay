import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const scanJourneys = [
  {
    icon: 'storefront',
    title: 'Payer un commercant',
    description: 'Scanner un QR marchand, verifier le montant et confirmer avec le PIN.',
  },
  {
    icon: 'request-page',
    title: "Regler une demande d'argent",
    description: "Accepter une demande envoyee par un autre user et payer depuis le wallet.",
  },
  {
    icon: 'badge',
    title: 'Afficher mon QR',
    description: 'Partager un QR personnel pour recevoir un transfert rapidement.',
  },
];

const scannerHighlights = [
  'QR personnel et marchand',
  'Verification cote backend',
  'Signature et statut du QR',
  'Paiement marchand et P2P',
];

const safetyRules = [
  'Toujours verifier le nom et le montant avant confirmation.',
  "Ne jamais valider un QR expire ou deja utilise.",
  'Reconfirmer les operations sensibles avec le PIN transactionnel.',
];

export default function ScannerScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: palette.surface, borderColor: palette.border }, BrandShadow.card]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIconWrap, { backgroundColor: palette.hero }]}>
              <BrandMark size={52} />
            </View>
            <View style={styles.heroCopy}>
              <ThemedText type="eyebrow" lightColor={palette.tint} darkColor={palette.tint}>
                Onglet scanner
              </ThemedText>
              <ThemedText type="title">{"Le QR devient le point d'entree."}</ThemedText>
            </View>
          </View>

          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {`${Brand.name} s'appuie sur des parcours QR lisibles: paiement marchand, demande d'argent et reception.`}
          </ThemedText>

          <View style={styles.highlightWrap}>
            {scannerHighlights.map((item) => (
              <View key={item} style={[styles.highlightPill, { backgroundColor: palette.card }]}>
                <ThemedText type="bodySmall">{item}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">Parcours a exposer ici</ThemedText>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            Fondes sur le backend actuel
          </ThemedText>
        </View>

        {scanJourneys.map((journey) => (
          <View
            key={journey.title}
            style={[
              styles.journeyCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}>
            <View style={[styles.journeyIconWrap, { backgroundColor: palette.card }]}>
              <MaterialIcons name={journey.icon} size={24} color={palette.tint} />
            </View>
            <View style={styles.journeyCopy}>
              <ThemedText type="defaultSemiBold">{journey.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {journey.description}
              </ThemedText>
            </View>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">Etape camera</ThemedText>
        </View>

        <View
          style={[
            styles.cameraCard,
            {
              backgroundColor: palette.hero,
            },
            BrandShadow.card,
          ]}>
          <View style={[styles.cameraIconWrap, { backgroundColor: 'rgba(250, 250, 247, 0.12)' }]}>
            <MaterialIcons name="qr-code-scanner" size={34} color={palette.heroText} />
          </View>
          <View style={styles.cameraCopy}>
            <ThemedText type="sectionTitle" lightColor={palette.heroText} darkColor={palette.heroText}>
              Prochaine integration
            </ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.heroText} darkColor={palette.heroText}>
              {"Brancher Expo Camera pour scanner, decoder, puis router vers paiement marchand ou demande d'argent."}
            </ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">Regles de confiance</ThemedText>
        </View>

        <View
          style={[
            styles.safetyCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.border,
            },
          ]}>
          {safetyRules.map((rule) => (
            <View key={rule} style={styles.safetyRow}>
              <MaterialIcons name="verified-user" size={18} color={palette.tint} />
              <ThemedText type="bodySmall" style={styles.safetyText}>
                {rule}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 120,
    gap: 18,
  },
  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    gap: 18,
  },
  heroTop: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  highlightWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  highlightPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeader: {
    marginTop: 6,
    gap: 4,
  },
  journeyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  journeyIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyCopy: {
    flex: 1,
    gap: 6,
  },
  cameraCard: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  cameraIconWrap: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCopy: {
    gap: 8,
  },
  safetyCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  safetyText: {
    flex: 1,
  },
});
