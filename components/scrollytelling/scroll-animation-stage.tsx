import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
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


type ScrollAnimationStageProps = {
  scrollY: SharedValue<number>;
};

export function ScrollAnimationStage({ scrollY }: ScrollAnimationStageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Scroll range for the animation sequence (e.g. 250px to 1400px)
  const START = 250;
  const MID = 800;
  const END = 1350;

  // Frame 1 Opacity & Scale (Putting on Mask)
  const frame1Style = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [START - 100, START, MID - 150, MID], [0, 1, 1, 0], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [START, MID], [1, 1.05], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [START, MID], [0, -15], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  // Frame 2 Opacity & Scale (Adjusting Cushion & Straps)
  const frame2Style = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [MID - 150, MID, END - 150, END], [0, 1, 1, 0], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [MID, END], [1, 1.06], Extrapolation.CLAMP);
    const rotate = `${interpolate(scrollY.value, [MID, END], [-2, 2], Extrapolation.CLAMP)}deg`;
    return {
      opacity,
      transform: [{ scale }, { rotate }],
    };
  });

  // Frame 3 Opacity & Scale (Peaceful Night Sleep with Airflow)
  const frame3Style = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [END - 150, END, END + 400], [0, 1, 0.9], Extrapolation.CLAMP);
    const scale = interpolate(scrollY.value, [END, END + 400], [0.98, 1.04], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Dynamic Narrative Text Cross-Fade
  const narrativeText1 = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START - 100, START, MID - 150], [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [START - 100, START], [15, 0], Extrapolation.CLAMP) }],
  }));

  const narrativeText2 = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [MID - 150, MID, END - 150], [0, 1, 0], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [MID - 150, MID], [15, 0], Extrapolation.CLAMP) }],
  }));

  const narrativeText3 = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [END - 150, END, END + 400], [0, 1, 1], Extrapolation.CLAMP),
    transform: [{ translateY: interpolate(scrollY.value, [END - 150, END], [15, 0], Extrapolation.CLAMP) }],
  }));

  // Floating Parallax Callout Pin
  const calloutPinStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [START, END], [20, -20], Extrapolation.CLAMP);
    const opacity = interpolate(scrollY.value, [START + 100, MID, END + 200], [0, 1, 0.8], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <GlassCard style={styles.container}>
      <Badge label="Scroll-Controlled Animation" variant="primary" style={{ marginBottom: Spacing.xs }} />
      <Text style={[styles.title, { color: colors.text }]}>CPAP Onboarding Sequence</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scroll down to play through the 3-stage bedtime routine animation.
      </Text>

      {/* Animation Stage Viewport */}
      <View style={[styles.viewport, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
        {/* Frame 1: Putting on Mask */}
        <Animated.View style={[styles.frameContainer, frame1Style]}>
          <Image
            contentFit="cover"
            source={require('@/assets/images/cpap-woman-setup.png')}
            style={styles.frameImage}
          />
        </Animated.View>

        {/* Frame 2: Adjusting Straps & Cushion */}
        <Animated.View style={[styles.frameContainer, frame2Style]}>
          <Image
            contentFit="cover"
            source={require('@/assets/images/cpap-woman-adjusting.png')}
            style={styles.frameImage}
          />
        </Animated.View>

        {/* Frame 3: Restful Night Sleep */}
        <Animated.View style={[styles.frameContainer, frame3Style]}>
          <Image
            contentFit="cover"
            source={require('@/assets/images/cpap-woman-sleeping.png')}
            style={styles.frameImage}
          />
        </Animated.View>

        {/* Parallax Floating Callout Pin */}
        <Animated.View style={[styles.calloutPin, { backgroundColor: colors.glassBackground, borderColor: colors.primary }, calloutPinStyle]}>
          <Text style={[styles.calloutPinText, { color: colors.primary }]}>✨ Quiet Airflow Active</Text>
        </Animated.View>
      </View>

      {/* Scroll-Driven Narrative Panel */}
      <View style={styles.narrativeContainer}>
        {/* Story Step 1 */}
        <Animated.View style={[styles.narrativeCard, narrativeText1]}>
          <Text style={[styles.stepKicker, { color: colors.primary }]}>Stage 01 • Mask Fitting</Text>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Positioning Cushion Over Nose</Text>
          <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
            Sit comfortably awake in bed. Place silicone cushion over your nose before fastening headgear straps.
          </Text>
        </Animated.View>

        {/* Story Step 2 */}
        <Animated.View style={[styles.narrativeCard, styles.absoluteNarrative, narrativeText2]}>
          <Text style={[styles.stepKicker, { color: colors.accent }]}>Stage 02 • Seal Adjustment</Text>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Adjusting Strap Tension for Zero Leaks</Text>
          <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
            Turn air pressure on. Adjust top and bottom straps evenly until dual cushion inflates comfortably.
          </Text>
        </Animated.View>

        {/* Story Step 3 */}
        <Animated.View style={[styles.narrativeCard, styles.absoluteNarrative, narrativeText3]}>
          <Text style={[styles.stepKicker, { color: colors.success }]}>Stage 03 • Continuous Therapy</Text>
          <Text style={[styles.stepTitle, { color: colors.text }]}>Restful & Uninterrupted Night Sleep</Text>
          <Text style={[styles.stepBody, { color: colors.textSecondary }]}>
            Pressurized airflow holds airway open smoothly, allowing deep restorative sleep all night.
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
  viewport: {
    height: 300,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  calloutPin: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    elevation: 4,
  },
  calloutPinText: {
    fontSize: 12,
    fontWeight: '800',
  },
  narrativeContainer: {
    minHeight: 100,
    position: 'relative',
    marginTop: Spacing.sm,
  },
  narrativeCard: {
    gap: 4,
  },
  absoluteNarrative: {
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
