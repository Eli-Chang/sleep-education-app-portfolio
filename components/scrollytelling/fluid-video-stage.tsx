import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';

type FluidVideoStageProps = {
  scrollY: SharedValue<number>;
};

export function FluidVideoStage({ scrollY }: FluidVideoStageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Scroll playback bounds (250px to 1450px)
  const START = 250;
  const MID1 = 650;
  const MID2 = 1050;
  const END = 1450;

  // Video Animation Layer 1: Pressurized Airflow Stream Dynamics
  const airStreamStyle = useAnimatedStyle(() => {
    const scaleX = interpolate(scrollY.value, [START, MID1], [0.4, 1], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [START - 50, START, MID1 - 100, MID1], [0, 1, 1, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scaleX }],
    };
  });

  // Video Animation Layer 2: Silicone Cushion & Strap Flexing
  const cushionFlexStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [MID1 - 100, MID1, MID2 - 100, MID2], [0.85, 1.12, 1.12, 0.85], Extrapolation.CLAMP);
    const rotate = `${interpolate(scrollY.value, [MID1, MID2], [-6, 6], Extrapolation.CLAMP)}deg`;
    const opacity = interpolate(scrollY.value, [MID1 - 100, MID1, MID2 - 100, MID2], [0, 1, 1, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }, { rotate }],
    };
  });

  // Video Animation Layer 3: Bedside Equipment Setup Assembly
  const setupAssemblyStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [MID2 - 100, MID2, END], [30, 0, -10], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [MID2 - 100, MID2, END], [0, 1, 1], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Narrative Card 1
  const narrative1Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START - 50, START, MID1 - 100], [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [START - 50, START], [12, 0], Extrapolation.CLAMP) }],
  }));

  // Narrative Card 2
  const narrative2Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [MID1 - 100, MID1, MID2 - 100], [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [MID1 - 100, MID1], [12, 0], Extrapolation.CLAMP) }],
  }));

  // Narrative Card 3
  const narrative3Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [MID2 - 100, MID2, END], [0, 1, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [MID2 - 100, MID2], [12, 0], Extrapolation.CLAMP) }],
  }));

  return (
    <GlassCard style={styles.container}>
      <Badge label="Scroll-Scrubbed Video Animation" variant="primary" style={{ marginBottom: Spacing.xs }} />
      <Text style={[styles.title, { color: colors.text }]}>60 FPS Motion Scrollytelling</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scroll down to scrub through continuous 60 FPS video animations.
      </Text>

      {/* 60 FPS Motion Stage Viewport */}
      <View style={[styles.canvasStage, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
        {/* Layer 1: Pressurized Airflow Ribbon Waves */}
        <Animated.View style={[styles.layerContainer, airStreamStyle]}>
          <View style={styles.vectorWaveBox}>
            <View style={[styles.vectorRibbon, { backgroundColor: '#06B6D4' }]} />
            <View style={[styles.vectorRibbon, { backgroundColor: '#38BDF8', width: '80%' }]} />
            <View style={[styles.vectorRibbon, { backgroundColor: '#818CF8', width: '60%' }]} />
            <View style={styles.vectorPulseDot} />
          </View>
        </Animated.View>

        {/* Layer 2: Silicone Cushion Rim & Strap Flex */}
        <Animated.View style={[styles.layerContainer, cushionFlexStyle]}>
          <View style={[styles.cushionRim, { borderColor: colors.primary }]}>
            <View style={[styles.cushionInner, { backgroundColor: colors.primaryLight }]} />
            <View style={[styles.strapArm, styles.strapArmLeft]} />
            <View style={[styles.strapArm, styles.strapArmRight]} />
          </View>
        </Animated.View>

        {/* Layer 3: Bedside Equipment Assembly */}
        <Animated.View style={[styles.layerContainer, setupAssemblyStyle]}>
          <View style={styles.assemblyBox}>
            <View style={[styles.motorBase, { backgroundColor: '#1E293B' }]}>
              <View style={styles.motorDisplay} />
            </View>
            <View style={[styles.waterChamber, { backgroundColor: 'rgba(6,182,212,0.3)' }]} />
            <View style={styles.heatedHose} />
          </View>
        </Animated.View>

        {/* Video Playhead Bar */}
        <View style={styles.playheadBar}>
          <Text style={[styles.playheadLabel, { color: '#FFFFFF' }]}>60 FPS Scroll-Scrubbed Video</Text>
        </View>
      </View>

      {/* Synchronized Narrative Cards */}
      <View style={styles.narrativeContainer}>
        <Animated.View style={[styles.narrativeCard, narrative1Style]}>
          <Text style={[styles.stepKicker, { color: '#06B6D4' }]}>Animation 01 • Pressurized Airflow</Text>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Continuous Air Stream Dynamics</Text>
          <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
            Watch pressurized air flow smoothly through calibrated ribbons to maintain open breathing channels.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.narrativeCard, styles.absoluteCard, narrative2Style]}>
          <Text style={[styles.stepKicker, { color: '#38BDF8' }]}>Animation 02 • Cushion Flexing</Text>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Silicone Seal Expansion & Strap Fit</Text>
          <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
            Observe how dual-wall silicone cushions inflate with air pressure to eliminate leaks with zero pressure marks.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.narrativeCard, styles.absoluteCard, narrative3Style]}>
          <Text style={[styles.stepKicker, { color: '#FBBF24' }]}>Animation 03 • Bedside Assembly</Text>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Complete Bedside System Setup</Text>
          <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
            See machine motor, humidifier water chamber, heated tubing, and mask connect step-by-step.
          </Text>
        </Animated.View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  canvasStage: {
    height: 240,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  layerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vectorWaveBox: {
    width: '80%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  vectorRibbon: {
    width: '100%',
    height: 12,
    borderRadius: BorderRadius.full,
  },
  vectorPulseDot: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: '#06B6D4',
  },
  cushionRim: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius.full,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cushionInner: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
  },
  strapArm: {
    position: 'absolute',
    width: 60,
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.sm,
  },
  strapArmLeft: {
    left: -50,
  },
  strapArmRight: {
    right: -50,
  },
  assemblyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  motorBase: {
    width: 100,
    height: 70,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motorDisplay: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    backgroundColor: '#06B6D4',
  },
  waterChamber: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  heatedHose: {
    width: 50,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FBBF24',
  },
  playheadBar: {
    position: 'absolute',
    bottom: Spacing.xs,
    alignSelf: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  playheadLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  narrativeContainer: {
    minHeight: 90,
    position: 'relative',
    marginTop: Spacing.sm,
  },
  narrativeCard: {
    gap: 4,
  },
  absoluteCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  stepKicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  stepTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '800',
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
