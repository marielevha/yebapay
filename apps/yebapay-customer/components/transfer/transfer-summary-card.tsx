import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors, BrandShadow } from '@/constants/brand';

type TransferSummaryCardProps = {
  title: string;
  rows: {
    label: string;
    value: string;
    strong?: boolean;
    accent?: 'default' | 'success' | 'danger';
  }[];
};

export function TransferSummaryCard({ title, rows }: TransferSummaryCardProps) {
  return (
    <View style={[styles.card, BrandShadow.card]}>
      <ThemedText type="sectionTitle">{title}</ThemedText>

      <View style={styles.rows}>
        {rows.map((row) => {
          const valueColor =
            row.accent === 'success'
              ? BrandColors.palm
              : row.accent === 'danger'
                ? BrandColors.clay
                : BrandColors.ink;

          return (
            <View key={`${row.label}-${row.value}`} style={styles.row}>
              <ThemedText type="bodySmall" lightColor={BrandColors.slate} darkColor={BrandColors.slate}>
                {row.label}
              </ThemedText>
              <ThemedText
                type={row.strong ? 'defaultSemiBold' : 'bodySmall'}
                style={styles.value}
                lightColor={valueColor}
                darkColor={valueColor}>
                {row.value}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    backgroundColor: '#F8FBF9',
    borderWidth: 1,
    borderColor: '#E3ECE6',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  value: {
    flex: 1,
    textAlign: 'right',
  },
});
