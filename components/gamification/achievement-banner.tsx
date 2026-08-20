import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';

type AchievementProps = {
  progress: number; // 0 to 100
};

export function AchievementBanner({ progress }: AchievementProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getBadges = () => [
    { label: 'OSA Novice', unlocked: progress >= 20, icon: '🌱' },
    { label: 'CPAP Explorer', unlocked: progress >= 50, icon: '💨' },
    { label: 'Troubleshooter', unlocked: progress >= 80, icon: '🔧' },
    { label: 'Sleep Master', unlocked: progress >= 100, icon: '🏆' },
  ];

  const badges = getBadges();

  return (
    <GlassCard style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Patient Achievements</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Complete quizzes to unlock patient readiness badges.
      </Text>

      <View style={styles.badgeRow}>
        {badges.map((b) => (
          <Animated.View
            key={b.label}
            entering={FadeInDown.duration(300)}
            style={[
              styles.badgeItem,
              {
                backgroundColor: b.unlocked ? colors.primaryLight : colors.background,
                borderColor: b.unlocked ? colors.primary : colors.cardBorder,
                opacity: b.unlocked ? 1 : 0.45,
              },
            ]}>
            <Text style={styles.badgeIcon}>{b.icon}</Text>
            <Text style={[styles.badgeLabel, { color: b.unlocked ? colors.primaryDark : colors.textMuted }]}>
              {b.label}
            </Text>
          </Animated.View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badgeItem: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  badgeIcon: {
    fontSize: 20,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
});
