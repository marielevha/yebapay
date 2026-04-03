import { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';

type AuthCodeInputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  length?: number;
};

export function AuthCodeInput({
  label,
  value,
  onChangeText,
  length = 6,
}: AuthCodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const cleanValue = value.replace(/[^0-9]/g, '').slice(0, length);

  return (
    <View style={styles.wrapper}>
      <ThemedText type="bodySmall" style={styles.label} lightColor={BrandColors.slate}>
        {label}
      </ThemedText>

      <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
        {Array.from({ length }).map((_, index) => {
          const digit = cleanValue[index];
          const active = index === cleanValue.length;

          return (
            <View
              key={`otp-${index}`}
              style={[
                styles.cell,
                active ? styles.cellActive : undefined,
                digit ? styles.cellFilled : undefined,
              ]}>
              <ThemedText type="defaultSemiBold" style={styles.digit}>
                {digit ?? ''}
              </ThemedText>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={cleanValue}
        onChangeText={(nextValue) => onChangeText(nextValue.replace(/[^0-9]/g, '').slice(0, length))}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  label: {
    paddingHorizontal: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cell: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E3ECE6',
    backgroundColor: '#F8FBF9',
  },
  cellActive: {
    borderColor: BrandColors.palm,
  },
  cellFilled: {
    backgroundColor: BrandColors.white,
  },
  digit: {
    fontSize: 20,
    lineHeight: 24,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
});
