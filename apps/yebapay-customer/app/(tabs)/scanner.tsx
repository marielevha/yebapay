import { MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Brand, BrandShadow } from '@/constants/brand';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useI18n } from '@/i18n/provider';

const SCAN_JOURNEYS = [
  {
    icon: 'storefront',
    titleKey: 'scanner.journeys.merchant.title',
    descriptionKey: 'scanner.journeys.merchant.description',
  },
  {
    icon: 'request-page',
    titleKey: 'scanner.journeys.request.title',
    descriptionKey: 'scanner.journeys.request.description',
  },
  {
    icon: 'badge',
    titleKey: 'scanner.journeys.personalQr.title',
    descriptionKey: 'scanner.journeys.personalQr.description',
  },
] as const;

const SCANNER_HIGHLIGHT_KEYS = [
  'scanner.hero.highlights.personal',
  'scanner.hero.highlights.verification',
  'scanner.hero.highlights.signature',
  'scanner.hero.highlights.payments',
] as const;

const SAFETY_RULE_KEYS = [
  'scanner.trust.verify',
  'scanner.trust.expired',
  'scanner.trust.pin',
] as const;

export default function ScannerScreen() {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const { t } = useI18n();

  const scanJourneys = SCAN_JOURNEYS.map((journey) => ({
    ...journey,
    title: t(journey.titleKey),
    description: t(journey.descriptionKey),
  }));
  const scannerHighlights = SCANNER_HIGHLIGHT_KEYS.map((key) => t(key));
  const safetyRules = SAFETY_RULE_KEYS.map((key) => t(key));

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.heroCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
            BrandShadow.card,
          ]}>
          <View style={styles.heroTop}>
            <View style={[styles.heroIconWrap, { backgroundColor: palette.hero }]}>
              <BrandMark size={52} />
            </View>
            <View style={styles.heroCopy}>
              <ThemedText type="eyebrow" lightColor={palette.tint} darkColor={palette.tint}>
                {t('scanner.hero.eyebrow')}
              </ThemedText>
              <ThemedText type="title">{t('scanner.hero.title')}</ThemedText>
            </View>
          </View>

          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('scanner.hero.description', { brandName: Brand.name })}
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
          <ThemedText type="sectionTitle">{t('scanner.journeys.title')}</ThemedText>
          <ThemedText type="bodySmall" lightColor={palette.textMuted} darkColor={palette.textMuted}>
            {t('scanner.journeys.subtitle')}
          </ThemedText>
        </View>

        {scanJourneys.map((journey) => (
          <View
            key={journey.titleKey}
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
          <ThemedText type="sectionTitle">{t('scanner.camera.sectionTitle')}</ThemedText>
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
              {t('scanner.camera.cardTitle')}
            </ThemedText>
            <ThemedText type="bodySmall" lightColor={palette.heroText} darkColor={palette.heroText}>
              {t('scanner.camera.description')}
            </ThemedText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="sectionTitle">{t('scanner.trust.title')}</ThemedText>
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
