import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing, BorderRadius } from '@/constants/theme';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { useHaptics } from '@/hooks/use-haptics';
import { palette } from '@/src/theme/tokens';

type Step = {
  id: string;
  title: string;
  detail: string;
};

const NIGHTLY_STEPS: Step[] = [
  { id: '1', title: '1. Inspect Humidifier Water Level', detail: 'Check that distilled water is filled up to the MAX fill line. Never run chamber dry.' },
  { id: '2', title: '2. Connect Air Hose & Tubing', detail: 'Ensure tubing is securely attached to both back of machine and front of mask swivel.' },
  { id: '3', title: '3. Position Mask Cushion on Face', detail: 'Place cushion over nose/mouth gently before pulling headgear straps over head.' },
  { id: '4', title: '4. Turn On Ramp / Start Air Flow', detail: 'Press Power button. If pressure feels strong, press Ramp button to build pressure over 20 minutes.' },
  { id: '5', title: '5. Perform Quick Seal Test', detail: 'Lie down in your normal sleep position (side or back) and check for air leaking toward eyes.' },
];

export default function ModalScreen() {
  const { triggerSelection, triggerNotification } = useHaptics();
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    const nextState = !completedSteps[id];
    if (nextState) {
      triggerNotification();
    } else {
      triggerSelection();
    }
    setCompletedSteps((prev) => ({ ...prev, [id]: nextState }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.responsiveWrapper}>
          <GlassCard style={styles.card}>
            <View style={styles.headerRow}>
              <Badge label="Nightly Checklist" variant="primary" />
              <Link href="/" dismissTo style={styles.closeButton}>
                <Text style={[styles.closeText, { color: palette.primary }]}>Close ✕</Text>
              </Link>
            </View>

            <Text style={[styles.title, { color: palette.ink }]}>CPAP Bedtime Setup & Leak Check</Text>
            <Text style={[styles.subtitle, { color: palette.body }]}>
              Tap each step as you complete your nightly setup routine before sleep.
            </Text>

            <View style={styles.stepList}>
              {NIGHTLY_STEPS.map((step) => {
                const checked = completedSteps[step.id];
                return (
                  <Animated.View key={step.id} layout={Layout.springify().damping(16)}>
                    <Pressable
                      onPress={() => toggleStep(step.id)}
                      style={[
                        styles.stepCard,
                        {
                          backgroundColor: checked ? palette.successSoft : palette.background,
                          borderColor: checked ? palette.success : palette.border,
                        },
                      ]}>
                      <View style={styles.stepHeader}>
                        <Text style={[styles.checkMark, { color: checked ? palette.success : palette.inkMuted }]}>
                          {checked ? '☑' : '☐'}
                        </Text>
                        <Text style={[styles.stepTitle, { color: palette.ink, textDecorationLine: checked ? 'line-through' : 'none' }]}>
                          {step.title}
                        </Text>
                      </View>
                      <Text style={[styles.stepDetail, { color: palette.body }]}>{step.detail}</Text>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>

            {completedCount === NIGHTLY_STEPS.length && (
              <Animated.View entering={FadeInUp.duration(300)} style={[styles.readyBanner, { backgroundColor: palette.successSoft, borderColor: palette.success }]}>
                <Text style={[styles.readyText, { color: palette.success }]}>🎉 All 5 steps ready! Have a safe and restful night of sleep.</Text>
              </Animated.View>
            )}
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: Spacing.md,
  },
  responsiveWrapper: {
    maxWidth: 768,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: Spacing.xs,
  },
  closeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  stepList: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  stepCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkMark: {
    fontSize: 18,
    fontWeight: '900',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
  },
  stepDetail: {
    fontSize: 13,
    lineHeight: 19,
    paddingLeft: Spacing.lg + 2,
  },
  readyBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  readyText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
