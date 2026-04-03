import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandShadow } from '@/constants/brand';

type AppTopBarProps = {
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  textMutedColor: string;
  textColor: string;
  eyebrow: string;
  displayName: string;
  onProfilePress: () => void;
  onActionPress: () => void;
};

function getInitials(displayName?: string | null) {
  if (!displayName) {
    return 'Y';
  }

  const parts = displayName
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return 'Y';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function AppTopBar({
  backgroundColor,
  surfaceColor,
  borderColor,
  textMutedColor,
  textColor,
  eyebrow,
  displayName,
  onProfilePress,
  onActionPress,
}: AppTopBarProps) {
  const firstName = displayName.trim().split(' ')[0] || displayName;

  return (
    <View
      style={[
        styles.shell,
        {
          backgroundColor,
          borderBottomColor: borderColor,
        },
      ]}>
      <View style={styles.topBar}>
        <View style={styles.left}>
          <Pressable
            onPress={onProfilePress}
            style={[
              styles.avatarWrap,
              {
                backgroundColor: surfaceColor,
                borderColor,
              },
              BrandShadow.card,
            ]}>
            <ThemedText type="defaultSemiBold">{getInitials(displayName)}</ThemedText>
          </Pressable>

          <View style={styles.copy}>
            <ThemedText type="bodySmall" lightColor={textMutedColor} darkColor={textMutedColor}>
              {eyebrow}
            </ThemedText>
            <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.name} lightColor={textColor} darkColor={textColor}>
              {firstName}
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={onActionPress}
          style={[
            styles.actionWrap,
            {
              backgroundColor: surfaceColor,
              borderColor,
            },
            BrandShadow.card,
          ]}>
          <MaterialIcons name="notifications-none" size={22} color={textColor} />
          <View style={styles.dot} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  copy: {
    gap: 2,
    maxWidth: 180,
  },
  name: {
    fontSize: 17,
  },
  actionWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
  },
  dot: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D79A2B',
  },
});
