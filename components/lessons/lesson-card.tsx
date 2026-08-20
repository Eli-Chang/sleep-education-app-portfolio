import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import type { Lesson } from '@/data/lessons';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { useHaptics } from '@/hooks/use-haptics';

type LessonCardProps = {
  lesson: Lesson;
};

export function LessonCard({ lesson }: LessonCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { triggerImpact } = useHaptics();
  const [expandedBullets, setExpandedBullets] = useState<Record<number, boolean>>({});

  const toggleBullet = (index: number) => {
    triggerImpact();
    setExpandedBullets((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <GlassCard style={styles.card}>
      <Badge label={lesson.section} variant="primary" style={{ marginBottom: Spacing.xs }} />
      <Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text>
      <Text style={[styles.summary, { color: colors.textSecondary }]}>{lesson.summary}</Text>

      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Key Teaching Points (Tap to expand)</Text>

      <View style={styles.bulletList}>
        {lesson.bullets.map((bullet, index) => {
          const isExpanded = expandedBullets[index] ?? true;
          return (
            <Animated.View
              layout={Layout.springify().damping(16)}
              entering={FadeInUp.delay(index * 50).duration(300)}
              key={bullet}
              style={[
                styles.bulletCard,
                { backgroundColor: colors.background, borderColor: colors.cardBorder },
              ]}>
              <Pressable onPress={() => toggleBullet(index)} style={styles.bulletHeader}>
                <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.bulletText, { color: colors.text }]}>{bullet}</Text>
                <Text style={[styles.expandIcon, { color: colors.primary }]}>{isExpanded ? '▲' : '▼'}</Text>
              </Pressable>
            </Animated.View>
          );
        })}
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
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    marginTop: Spacing.xs,
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  bulletList: {
    gap: Spacing.sm,
  },
  bulletCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  bulletHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bulletDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  expandIcon: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
});
