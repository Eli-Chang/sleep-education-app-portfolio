import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeIn,
  FadeInUp,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';

type AirwayState = 'normal' | 'obstructed' | 'cpap';

type AirwayVisualizerProps = {
  scrollY?: SharedValue<number>;
};

export function AirwayVisualizer({ scrollY }: AirwayVisualizerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [state, setState] = useState<AirwayState>('cpap');
  const [pressureLevel, setPressureLevel] = useState<number>(8); // 4 to 20 cmH2O

  const airwayWidthMultiplier = state === 'obstructed' ? 0.25 : state === 'normal' ? 0.75 : 0.4 + (pressureLevel / 20) * 0.6;

  // Cycle 2: Dynamic Scroll-driven Airway Expansion
  const airwayAnimatedStyle = useAnimatedStyle(() => {
    let scrollExpansion = 0;
    if (scrollY) {
      scrollExpansion = interpolate(scrollY.value, [200, 600], [0, 0.18], Extrapolation.CLAMP);
    }
    const baseWidth = airwayWidthMultiplier + scrollExpansion;
    return {
      width: withSpring(`${Math.min(100, baseWidth * 100)}%`, { damping: 14, stiffness: 100 }),
      backgroundColor: withSpring(
        state === 'obstructed' ? colors.danger : state === 'normal' ? colors.secondary : colors.primary
      ),
    };
  });

  const getStatusInfo = () => {
    switch (state) {
      case 'obstructed':
        return {
          title: 'Obstructed Airway (OSA)',
          description: 'Throat muscles relax during sleep, causing the airway to narrow or collapse shut and interrupt breathing.',
          badgeVariant: 'danger' as const,
        };
      case 'normal':
        return {
          title: 'Awake / Open Airway',
          description: 'Muscle tone keeps the airway open naturally during wakefulness.',
          badgeVariant: 'secondary' as const,
        };
      default:
        return {
          title: `CPAP Airway Pressure (${pressureLevel} cmH₂O)`,
          description: 'Continuous positive air pressure acts as a soft pneumatic splint, holding the airway open all night.',
          badgeVariant: 'primary' as const,
        };
    }
  };

  const status = getStatusInfo();

  return (
    <GlassCard style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerTextGroup}>
          <Badge label="Scroll-Driven Anatomy" variant="primary" style={{ marginBottom: Spacing.xs }} />
          <Text style={[styles.title, { color: colors.text }]}>Airway & CPAP Pressure Simulator</Text>
        </View>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scroll down or toggle states to see how CPAP prevents airway blockage in real-time.
      </Text>

      {/* State Switch Buttons */}
      <View style={styles.buttonGroup}>
        {(['obstructed', 'normal', 'cpap'] as AirwayState[]).map((mode) => {
          const active = state === mode;
          const label = mode === 'obstructed' ? 'Blocked (OSA)' : mode === 'normal' ? 'Normal' : 'CPAP Therapy';
          return (
            <Pressable
              key={mode}
              onPress={() => setState(mode)}
              style={[
                styles.modeButton,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.cardBorder,
                },
              ]}>
              <Text style={[styles.modeButtonText, { color: active ? '#FFFFFF' : colors.text }]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Anatomical Airway Graphic Canvas */}
      <View style={[styles.diagramCanvas, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
        <View style={styles.tissueWallLeft} />
        <View style={styles.airwayChannel}>
          <Animated.View style={[styles.airwayPassage, airwayAnimatedStyle]} />
        </View>
        <View style={styles.tissueWallRight} />

        {/* Airflow particle indicator */}
        <Animated.View key={state} entering={FadeIn.duration(300)} style={styles.airflowIndicator}>
          <Text style={[styles.airflowText, { color: colors.textMuted }]}>
            {state === 'obstructed' ? '⚠️ Airway Restricted' : '💨 Airflow Restored'}
          </Text>
        </Animated.View>
      </View>

      {/* CPAP Pressure Ramp Controller */}
      {state === 'cpap' && (
        <Animated.View entering={FadeInUp.duration(280)} style={styles.pressureControls}>
          <Text style={[styles.controlLabel, { color: colors.text }]}>
            Simulated Prescribed Pressure: <Text style={{ color: colors.primary, fontWeight: '900' }}>{pressureLevel} cmH₂O</Text>
          </Text>
          <View style={styles.pressureButtonsRow}>
            {[4, 8, 12, 16, 20].map((val) => (
              <Pressable
                key={val}
                onPress={() => setPressureLevel(val)}
                style={[
                  styles.pressurePill,
                  {
                    backgroundColor: pressureLevel === val ? colors.primary : colors.card,
                    borderColor: pressureLevel === val ? colors.primary : colors.cardBorder,
                  },
                ]}>
                <Text style={[styles.pressurePillText, { color: pressureLevel === val ? '#FFFFFF' : colors.text }]}>
                  {val}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Status Description Card */}
      <View style={[styles.statusBox, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
        <Badge label={status.title} variant={status.badgeVariant} style={{ marginBottom: 4 }} />
        <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>{status.description}</Text>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },
  diagramCanvas: {
    height: 140,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  tissueWallLeft: {
    width: 24,
    height: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRightWidth: 2,
    borderRightColor: '#EF4444',
  },
  airwayChannel: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  airwayPassage: {
    height: '70%',
    borderRadius: BorderRadius.md,
    opacity: 0.85,
  },
  tissueWallRight: {
    width: 24,
    height: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 2,
    borderLeftColor: '#EF4444',
  },
  airflowIndicator: {
    position: 'absolute',
    bottom: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  airflowText: {
    fontSize: 11,
    fontWeight: '700',
  },
  pressureControls: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  controlLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  pressureButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  pressurePill: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  pressurePillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.xs,
    gap: 4,
  },
  statusDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
});
