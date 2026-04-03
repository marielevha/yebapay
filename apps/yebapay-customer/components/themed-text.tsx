import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default'
    | 'title'
    | 'hero'
    | 'balance'
    | 'defaultSemiBold'
    | 'subtitle'
    | 'sectionTitle'
    | 'eyebrow'
    | 'bodySmall'
    | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'hero' ? styles.hero : undefined,
        type === 'balance' ? styles.balance : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'sectionTitle' ? styles.sectionTitle : undefined,
        type === 'eyebrow' ? styles.eyebrow : undefined,
        type === 'bodySmall' ? styles.bodySmall : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
  },
  hero: {
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 42,
  },
  balance: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  eyebrow: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    lineHeight: 24,
    fontSize: 15,
    fontWeight: '600',
  },
});
