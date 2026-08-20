import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BadgeProps = {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  style?: ViewStyle;
};

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getColors = () => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.secondaryLight, text: colors.secondary };
      case 'success':
        return { bg: colors.successLight, text: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'neutral':
        return { bg: colors.cardBorder, text: colors.textSecondary };
      default:
        return { bg: colors.primaryLight, text: colors.primaryDark };
    }
  };

  const badgeColors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: badgeColors.bg }, style]}>
      <Text style={[styles.label, { color: badgeColors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
