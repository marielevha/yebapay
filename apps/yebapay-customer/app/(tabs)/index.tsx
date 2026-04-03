import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BrandCopy, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const quickActionMeta = {
  Scanner: {
    icon: 'qr-code-scanner',
    title: 'Payer par QR',
    description: 'Scanner un QR marchand ou une demande de paiement.',
  },
  Transferer: {
    icon: 'swap-horiz',
    title: 'Envoyer',
    description: 'Transferer des fonds entre particuliers avec idempotence.',
  },
  Demander: {
    icon: 'request-page',
    title: 'Demander',
    description: "Creer une demande d'argent payable tout de suite ou plus tard.",
  },
  'Mon QR': {
    icon: 'badge',
    title: 'Recevoir',
    description: 'Partager un QR personnel pour etre paye plus vite.',
  },
} as const;

const backendReadiness = [
  'Authentification + refresh token',
  'Wallet + historique',
  'Transfert P2P avec ledger',
  "Demande d'argent",
  'Paiement marchand',
  'QR decode et verification',
];

const promiseCards = [
  {
    icon: 'visibility',
    title: 'Frais visibles',
    description: "Le montant, les frais et le net credite restent lisibles avant confirmation.",
  },
  {
    icon: 'bolt',
    title: 'Rapide au comptoir',
    description: 'Le parcours QR est pense pour payer en quelques etapes, pas en plusieurs menus.',
  },
  {
    icon: 'history',
    title: 'Flux tracables',
    description: "Le backend garde l'historique transactionnel et comptable comme source de verite.",
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const quickActions = BrandCopy.quickActions.map((label) => ({
    label,
    ...quickActionMeta[label],
  }));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroCard, { backgroundColor: palette.hero }, BrandShadow.card]}>
          <View style={[styles.heroGlowPrimary, { backgroundColor: palette.heroSecondary }]} />
          <View style={[styles.heroGlowSecondary, { backgroundColor: palette.warning }]} />

          <View style={styles.heroHeader}>
            <BrandMark size={58} />
            <View style={styles.heroHeaderCopy}>
              <ThemedText type="eyebrow" lightColor={palette.heroText} darkColor={palette.heroText}>
                Wallet QR
              </ThemedText>
              <ThemedText
                type="sectionTitle"
                lightColor={palette.heroText}
                darkColor={palette.heroText}>
                {Brand.name}
              </ThemedText>
            </View>
          </View>

          <ThemedText type="hero" lightColor={palette.heroText} darkColor={palette.heroText}>
            {Brand.slogan}
          </ThemedText>
          <ThemedText
            type="bodySmall"
            style={styles.heroBody}
            lightColor={palette.heroText}
            darkColor={palette.heroText}>
            {Brand.productLine} Une base mobile claire pour transferer, demander et payer.
          </ThemedText>

          <View style={styles.heroPills}>
            {BrandCopy.trustPillars.map((pillar) => (
              <View
                key={pillar}
                style={[styles.heroPill, { backgroundColor: 'rgba(250, 250, 247, 0.14)' }]}>
                <ThemedText type="bodySmall" lightColor={palette.heroText} darkColor={palette.heroText}>
                  {pillar}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">Solde principal</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {"Carte d'accueil prete a etre branchee sur GET /wallets/me"}
            </ThemedText>
          </View>
          <View style={[styles.liveBadge, { backgroundColor: palette.card }]}>
            <ThemedText type="eyebrow" lightColor={palette.tint} darkColor={palette.tint}>
              MVP
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.balanceCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
            BrandShadow.card,
          ]}>
          <View style={styles.balanceHeader}>
            <View>
              <ThemedText type="eyebrow" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                Compte ordinaire
              </ThemedText>
              <ThemedText type="balance">24 350 FCFA</ThemedText>
            </View>
            <View style={[styles.balanceIconWrap, { backgroundColor: palette.card }]}>
              <MaterialIcons name="account-balance-wallet" size={26} color={palette.tint} />
            </View>
          </View>

          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                Disponible
              </ThemedText>
              <ThemedText type="defaultSemiBold">24 350 FCFA</ThemedText>
            </View>
            <View style={styles.balanceStat}>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                Derniere activite
              </ThemedText>
              <ThemedText type="defaultSemiBold">P2P + paiement marchand</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">Raccourcis</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              Les parcours deja portes par le backend deviennent des tuiles claires ici.
            </ThemedText>
          </View>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <View
              key={action.label}
              style={[
                styles.quickCard,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}>
              <View style={[styles.quickIconWrap, { backgroundColor: palette.card }]}>
                <MaterialIcons name={action.icon} size={26} color={palette.tint} />
              </View>
              <ThemedText type="defaultSemiBold">{action.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {action.description}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">Pret cote backend</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              Cette premiere home met en avant ce qui est deja branchable sans inventer de faux flux.
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.backendCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}>
          {backendReadiness.map((item) => (
            <View key={item} style={styles.backendRow}>
              <View style={[styles.backendDot, { backgroundColor: palette.success }]} />
              <ThemedText>{item}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="sectionTitle">Pourquoi ca change</ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
              Le branding doit soutenir une promesse simple: moins de friction, plus de lisibilite.
            </ThemedText>
          </View>
        </View>

        {promiseCards.map((card) => (
          <View
            key={card.title}
            style={[
              styles.promiseCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.border,
              },
            ]}>
            <View style={[styles.promiseIconWrap, { backgroundColor: palette.surface }]}>
              <MaterialIcons name={card.icon} size={24} color={palette.text} />
            </View>
            <View style={styles.promiseCopy}>
              <ThemedText type="defaultSemiBold">{card.title}</ThemedText>
              <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
                {card.description}
              </ThemedText>
            </View>
          </View>
        ))}
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
    overflow: 'hidden',
    borderRadius: 28,
    padding: 22,
    gap: 18,
    minHeight: 270,
  },
  heroGlowPrimary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -80,
    right: -50,
    opacity: 0.18,
  },
  heroGlowSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: -54,
    left: -24,
    opacity: 0.16,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroHeaderCopy: {
    gap: 2,
  },
  heroBody: {
    maxWidth: '92%',
    opacity: 0.9,
  },
  heroPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  heroPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 4,
  },
  liveBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  balanceCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 18,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  balanceIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  balanceStat: {
    minWidth: 140,
    gap: 4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  quickCard: {
    width: '48%',
    minWidth: 152,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  quickIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backendCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  backendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  promiseCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    flexDirection: 'row',
    gap: 14,
  },
  promiseIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseCopy: {
    flex: 1,
    gap: 6,
  },
});
