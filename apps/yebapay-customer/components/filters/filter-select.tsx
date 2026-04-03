import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type FilterSelectOption = {
  value: string;
  label: string;
  description?: string;
};

type FilterSelectProps = {
  label: string;
  title: string;
  selectedValue: string;
  options: FilterSelectOption[];
  onChange: (value: string) => void;
  icon: keyof typeof MaterialIcons.glyphMap;
  fullWidth?: boolean;
};

export function FilterSelect({
  label,
  title,
  selectedValue,
  options,
  onChange,
  icon,
  fullWidth = false,
}: FilterSelectProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === selectedValue) ?? options[0],
    [options, selectedValue]
  );

  return (
    <>
      <View style={styles.fieldGroup}>
        <Pressable
          onPress={() => setOpen(true)}
          style={[
            styles.field,
            fullWidth ? styles.fieldFullWidth : styles.fieldCompact,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
            },
          ]}>
          <View style={[styles.iconWrap, { backgroundColor: palette.card }]}>
            <MaterialIcons name={icon} size={18} color={palette.tint} />
          </View>

          <View style={styles.fieldCopy}>
            <ThemedText type="bodySmall" numberOfLines={1} lightColor={palette.textMuted} darkColor={palette.textMuted}>
              {label}
            </ThemedText>
            <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.valueText}>
              {selectedOption?.label ?? ''}
            </ThemedText>
            {fullWidth && selectedOption?.description ? (
              <ThemedText
                type="bodySmall"
                numberOfLines={1}
                lightColor={palette.textMuted}
                darkColor={palette.textMuted}>
                {selectedOption.description}
              </ThemedText>
            ) : null}
          </View>

          <MaterialIcons name="keyboard-arrow-down" size={24} color={palette.textMuted} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
            }}
            style={[
              styles.sheet,
              {
                backgroundColor: palette.background,
                borderColor: palette.border,
              },
            ]}>
            <View style={styles.sheetHeader}>
              <ThemedText type="sectionTitle">{title}</ThemedText>
              <Pressable onPress={() => setOpen(false)} hitSlop={8}>
                <MaterialIcons name="close" size={22} color={palette.textMuted} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.optionsList}>
              {options.map((option) => {
                const isSelected = option.value === selectedValue;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.optionRow,
                      {
                        backgroundColor: isSelected ? palette.surface : 'transparent',
                        borderColor: palette.border,
                      },
                    ]}>
                    <View style={styles.optionCopy}>
                      <ThemedText type="defaultSemiBold" numberOfLines={1}>
                        {option.label}
                      </ThemedText>
                      {option.description ? (
                        <ThemedText
                          type="bodySmall"
                          numberOfLines={1}
                          lightColor={palette.textMuted}
                          darkColor={palette.textMuted}>
                          {option.description}
                        </ThemedText>
                      ) : null}
                    </View>

                    {isSelected ? <MaterialIcons name="check" size={20} color={palette.tint} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    flex: 1,
  },
  field: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldCompact: {
    minWidth: 0,
  },
  fieldFullWidth: {
    width: '100%',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCopy: {
    flex: 1,
    gap: 1,
    minWidth: 0,
  },
  valueText: {
    lineHeight: 22,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14,21,19,0.36)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: '72%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  optionsList: {
    gap: 8,
    paddingBottom: 12,
  },
  optionRow: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionCopy: {
    flex: 1,
    gap: 2,
  },
});
