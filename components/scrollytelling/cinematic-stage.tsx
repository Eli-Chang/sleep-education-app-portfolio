import { StyleSheet, Text, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
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

const AnimatedImage = Animated.createAnimatedComponent(Image);

type StageScene = {
  kicker: string;
  title: string;
  subtitle: string;
  image: ImageSource;
  accentColor: string;
};

const STAGE_SCENES: StageScene[] = [
  {
    kicker: 'Chapter 01 • Airflow & Rhythm',
    title: 'Pressurized air gently holds breathing open all night long.',
    subtitle: 'Continuous Positive Airway Pressure prevents interrupted sleep by maintaining open airway channels.',
    image: require('@/assets/images/sleep-cartoon-fullface-pregnant.png'),
    accentColor: '#06B6D4',
  },
  {
    kicker: 'Chapter 02 • Precision Mask Comfort',
    title: 'Custom cushion seals designed for quiet, leak-free sleep.',
    subtitle: 'Nasal and full-face silicone cushions inflate with air pressure to eliminate leaks without tightness.',
    image: require('@/assets/images/sleep-cartoon-nasal-pregnant.png'),
    accentColor: '#38BDF8',
  },
  {
    kicker: 'Chapter 03 • Bedside Routine Sequence',
    title: 'Machine motor, humidifier, tubing, and mask in harmony.',
    subtitle: 'A simple 5-minute setup routine prepares your device for safe, restorative sleep every night.',
    image: require('@/assets/images/sleep-cartoon-setup-pregnant.png'),
    accentColor: '#FBBF24',
  },
];

type CinematicStageProps = {
  scrollY: SharedValue<number>;
};

export function CinematicStage({ scrollY }: CinematicStageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const stage3DStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [200, 500, 900, 1400], [0.92, 1, 1.04, 0.96], Extrapolation.CLAMP);
    const rotateY = `${interpolate(scrollY.value, [200, 700, 1300], [-12, 0, 12], Extrapolation.CLAMP)}deg`;
    const rotateX = `${interpolate(scrollY.value, [200, 700, 1300], [6, 0, -6], Extrapolation.CLAMP)}deg`;
    return {
      transform: [
        { perspective: 900 },
        { scale },
        { rotateY },
        { rotateX },
      ],
    };
  });

  const imageScrubStyle = useAnimatedStyle(() => {
    const translateY = interpolate(scrollY.value, [200, 1400], [-25, 25], Extrapolation.CLAMP);
    return {
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={stage3DStyle}>
        <GlassCard style={styles.stageCard}>
          <Badge label="Interactive 3D Scrollytelling Showcase" variant="primary" style={{ marginBottom: Spacing.xs }} />

          <View style={[styles.canvas, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
            <Animated.View style={[styles.imageWrapper, imageScrubStyle]}>
              <AnimatedImage
                contentFit="cover"
                source={STAGE_SCENES[0].image}
                style={styles.stageImage}
              />
            </Animated.View>
          </View>

          <View style={styles.narrativePanel}>
            <Text style={[styles.kicker, { color: STAGE_SCENES[0].accentColor }]}>{STAGE_SCENES[0].kicker}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{STAGE_SCENES[0].title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{STAGE_SCENES[0].subtitle}</Text>
          </View>

          <View style={styles.scrollyIndicatorRow}>
            {[0, 1, 2].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.indicatorDot,
                  { backgroundColor: idx === 0 ? colors.primary : colors.cardBorder },
                ]}
              />
            ))}
          </View>
        </GlassCard>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.lg,
  },
  stageCard: {
    padding: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
  },
  canvas: {
    height: 260,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  stageImage: {
    width: '100%',
    height: '100%',
  },
  narrativePanel: {
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollyIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  indicatorDot: {
    width: 24,
    height: 6,
    borderRadius: BorderRadius.full,
  },
});
