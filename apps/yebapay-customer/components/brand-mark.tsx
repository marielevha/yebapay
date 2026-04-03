import { StyleSheet, Text, View } from 'react-native';

import { BrandColors } from '@/constants/brand';

type BrandMarkProps = {
  size?: number;
};

export function BrandMark({ size = 44 }: BrandMarkProps) {
  const corner = Math.max(8, Math.round(size * 0.18));
  const stroke = Math.max(4, Math.round(size * 0.12));
  const dot = Math.max(8, Math.round(size * 0.22));

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: Math.round(size * 0.28) }]}>
      <View style={[styles.cornerTopLeft, { width: corner * 1.7, height: stroke, borderRadius: stroke / 2 }]} />
      <View style={[styles.cornerTopLeftVertical, { width: stroke, height: corner * 1.7, borderRadius: stroke / 2 }]} />

      <View style={[styles.cornerTopRight, { width: corner * 1.7, height: stroke, borderRadius: stroke / 2 }]} />
      <View style={[styles.cornerTopRightVertical, { width: stroke, height: corner * 1.7, borderRadius: stroke / 2 }]} />

      <View style={[styles.cornerBottomLeft, { width: corner * 1.7, height: stroke, borderRadius: stroke / 2 }]} />
      <View style={[styles.cornerBottomLeftVertical, { width: stroke, height: corner * 1.7, borderRadius: stroke / 2 }]} />

      <View style={[styles.cornerBottomRight, { width: corner * 1.7, height: stroke, borderRadius: stroke / 2 }]} />
      <View style={[styles.cornerBottomRightVertical, { width: stroke, height: corner * 1.7, borderRadius: stroke / 2 }]} />

      <Text style={[styles.letter, { fontSize: size * 0.42, lineHeight: size * 0.42 }]}>Y</Text>
      <View style={[styles.dotOuter, { width: dot, height: dot, borderRadius: dot / 2 }]} />
      <View
        style={[
          styles.dotInner,
          {
            width: dot * 0.42,
            height: dot * 0.42,
            borderRadius: (dot * 0.42) / 2,
            top: size * 0.26 + dot * 0.29,
            right: size * 0.18 + dot * 0.29,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: BrandColors.cloud,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    color: BrandColors.palm,
    fontWeight: '900',
    zIndex: 2,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: BrandColors.ink,
  },
  cornerTopLeftVertical: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: BrandColors.ink,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: BrandColors.ink,
  },
  cornerTopRightVertical: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: BrandColors.ink,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: BrandColors.ink,
  },
  cornerBottomLeftVertical: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: BrandColors.ink,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BrandColors.ink,
  },
  cornerBottomRightVertical: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: BrandColors.ink,
  },
  dotOuter: {
    position: 'absolute',
    top: '26%',
    right: '18%',
    backgroundColor: BrandColors.sun,
    zIndex: 3,
  },
  dotInner: {
    position: 'absolute',
    backgroundColor: BrandColors.cloud,
    zIndex: 4,
  },
});
