import { MaterialIcons } from '@expo/vector-icons';
import { ComponentProps, useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/brand';

type AuthFieldProps = TextInputProps & {
  label?: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  actionIcon?: ComponentProps<typeof MaterialIcons>['name'];
  onActionPress?: () => void;
  actionAccessibilityLabel?: string;
  actionColor?: string;
};

export function AuthField({
  label,
  icon,
  secureTextEntry,
  actionIcon,
  onActionPress,
  actionAccessibilityLabel,
  actionColor,
  style,
  ...props
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const isPasswordField = Boolean(secureTextEntry);
  const actualSecureTextEntry = useMemo(() => {
    if (!isPasswordField) {
      return false;
    }

    return !visible;
  }, [isPasswordField, visible]);

  return (
    <View style={styles.wrapper}>
      {label ? (
        <ThemedText type="bodySmall" style={styles.label} lightColor={BrandColors.slate}>
          {label}
        </ThemedText>
      ) : null}

      <View
        style={[
          styles.inputShell,
          focused ? styles.inputShellFocused : undefined,
        ]}>
        <MaterialIcons name={icon} size={20} color={focused ? BrandColors.palm : '#9AA9A4'} />
        <TextInput
          {...props}
          style={[styles.input, style]}
          placeholderTextColor="#9AA9A4"
          secureTextEntry={actualSecureTextEntry}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
        />
        {isPasswordField ? (
          <Pressable onPress={() => setVisible((value) => !value)} hitSlop={8}>
            <MaterialIcons
              name={visible ? 'visibility-off' : 'visibility'}
              size={20}
              color="#9AA9A4"
            />
          </Pressable>
        ) : actionIcon && onActionPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={actionAccessibilityLabel}
            onPress={onActionPress}
            hitSlop={8}>
            <MaterialIcons
              name={actionIcon}
              size={20}
              color={actionColor ?? (focused ? BrandColors.palm : '#9AA9A4')}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    paddingHorizontal: 2,
  },
  inputShell: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E3ECE6',
    backgroundColor: '#F8FBF9',
  },
  inputShellFocused: {
    borderColor: '#1E6B5B',
    backgroundColor: BrandColors.white,
  },
  input: {
    flex: 1,
    color: BrandColors.ink,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
  },
});
