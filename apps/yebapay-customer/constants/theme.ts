import { Platform } from 'react-native';
import { BrandColors } from '@/constants/brand';

const tintColorLight = BrandColors.palm;
const tintColorDark = BrandColors.sun;

export const Colors = {
  light: {
    text: BrandColors.ink,
    textMuted: BrandColors.slate,
    background: BrandColors.cloud,
    surface: BrandColors.white,
    card: BrandColors.sand,
    border: '#D8E3DD',
    tint: tintColorLight,
    icon: BrandColors.slate,
    tabIconDefault: '#8AA09B',
    tabIconSelected: tintColorLight,
    success: BrandColors.palm,
    warning: BrandColors.sun,
    danger: BrandColors.clay,
    hero: BrandColors.ink,
    heroSecondary: BrandColors.palm,
    heroText: BrandColors.cloud,
  },
  dark: {
    text: '#F5F3EE',
    textMuted: '#B4C1BC',
    background: '#0E1513',
    surface: '#17211F',
    card: '#1E2C29',
    border: '#2C3D39',
    tint: tintColorDark,
    icon: '#98A6A1',
    tabIconDefault: '#82938D',
    tabIconSelected: '#F5F3EE',
    success: '#4EB39C',
    warning: BrandColors.sun,
    danger: '#F08A68',
    hero: '#10211F',
    heroSecondary: '#1E6B5B',
    heroText: '#F8F7F2',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
