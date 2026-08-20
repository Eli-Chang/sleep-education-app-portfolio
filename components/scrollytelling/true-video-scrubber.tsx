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

type FrameData = {
  id: number;
  label: string;
  detail: string;
  source: ImageSource;
};

const FRAMES: FrameData[] = [
  {
    id: 1,
    label: 'Frame 1 • Holding Mask',
    detail: 'Patient sitting in bed, holding the CPAP nasal mask before positioning.',
    source: require('@/assets/images/frame1-holding-mask.png'),
  },
  {
    id: 2,
    label: 'Frame 2 • Raising to Face',
    detail: 'Raising the mask up toward nose and mouth alignment.',
    source: require('@/assets/images/frame2-raising-mask.png'),
  },
  {
    id: 3,
    label: 'Frame 3 • Placing Cushion',
    detail: 'Positioning dual-wall silicone cushion gently against nasal bridge.',
    source: require('@/assets/images/frame3-placing-cushion.png'),
  },
  {
    id: 4,
    label: 'Frame 4 • Fastening Straps',
    detail: 'Securing headgear straps evenly on both sides for zero leaks.',
    source: require('@/assets/images/frame4-fastening-straps.png'),
  },
  {
    id: 5,
    label: 'Frame 5 • Lying Down',
    detail: 'Lying back on pillow into comfortable sleep position.',
    source: require('@/assets/images/frame5-lying-down.png'),
  },
  {
    id: 6,
    label: 'Frame 6 • Peaceful CPAP Sleep',
    detail: 'Continuous pressurized airflow streams softly for a full night of restorative sleep.',
    source: require('@/assets/images/frame6-peaceful-sleep.png'),
  },
];

type TrueVideoScrubberProps = {
  scrollY: SharedValue<number>;
};

export function TrueVideoScrubber({ scrollY }: TrueVideoScrubberProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Scroll playback bounds (250px to 1450px)
  const START = 250;
  const END = 1450;
  const RANGE = (END - START) / (FRAMES.length - 1);

  // Individual frame cross-dissolve styles
  const f1Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START, START + RANGE], [1, 0], Extrapolation.CLAMP),
  }));

  const f2Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START, START + RANGE, START + RANGE * 2], [0, 1, 0], Extrapolation.CLAMP),
  }));

  const f3Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START + RANGE, START + RANGE * 2, START + RANGE * 3], [0, 1, 0], Extrapolation.CLAMP),
  }));

  const f4Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START + RANGE * 2, START + RANGE * 3, START + RANGE * 4], [0, 1, 0], Extrapolation.CLAMP),
  }));

  const f5Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START + RANGE * 3, START + RANGE * 4, START + RANGE * 5], [0, 1, 0], Extrapolation.CLAMP),
  }));

  const f6Style = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [START + RANGE * 4, END], [0, 1], Extrapolation.CLAMP),
  }));

  const frameStyles = [f1Style, f2Style, f3Style, f4Style, f5Style, f6Style];

  // Scrubbed Progress Bar
  const progressBarStyle = useAnimatedStyle(() => {
    const widthPercent = interpolate(scrollY.value, [START, END], [0, 100], Extrapolation.CLAMP);
    return {
      width: `${widthPercent}%`,
    };
  });

  return (
    <GlassCard style={styles.container}>
      <Badge label="True Frame-by-Frame Video Animation" variant="primary" style={{ marginBottom: Spacing.xs }} />
      <Text style={[styles.title, { color: colors.text }]}>Scroll-Scrubbed Video Animation</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scroll down with your mouse to physically play out the 6-frame video animation of a patient using CPAP.
      </Text>

      {/* Frame-by-Frame Video Viewport */}
      <View style={[styles.viewport, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
        {FRAMES.map((frame, index) => (
          <Animated.View key={frame.id} style={[styles.frameLayer, frameStyles[index]]}>
            <AnimatedImage
              contentFit="cover"
              source={frame.source}
              style={styles.frameImage}
            />
          </Animated.View>
        ))}

        {/* Video Scrubber Timeline Bar */}
        <View style={styles.timelineOverlay}>
          <View style={[styles.timelineTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <Animated.View style={[styles.timelineFill, { backgroundColor: colors.primary }, progressBarStyle]} />
          </View>
          <Text style={styles.timelineLabel}>📹 Scroll Video Scrub</Text>
        </View>
      </View>

      {/* Narrative Step Details */}
      <View style={styles.narrativeBox}>
        <Text style={[styles.narrativeTitle, { color: colors.text }]}>Bedtime CPAP Setup & Sleep Sequence</Text>
        <Text style={[styles.narrativeBody, { color: colors.textSecondary }]}>
          As you scroll, the animation plays out frame-by-frame: holding mask ➔ raising to face ➔ placing cushion ➔ fastening headgear straps ➔ lying back on pillow ➔ deep restful sleep.
        </Text>
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
    height: 320,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  frameImage: {
    width: '100%',
    height: '100%',
  },
  timelineOverlay: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    gap: 6,
    padding: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  timelineTrack: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  timelineFill: {
    height: '100%',
  },
  timelineLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  narrativeBox: {
    marginTop: Spacing.xs,
    gap: 4,
  },
  narrativeTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  narrativeBody: {
    fontSize: 14,
    lineHeight: 20,
  },
});
