import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';


const VIDEO_SECTION_HEIGHT = 600;

type HiggsfieldVideoScrubberProps = {
  scrollY: SharedValue<number>;
  videoSource?: string;
  /** Height of the scroll-pinned video section (default 600) */
  sectionHeight?: number;
};

/**
 * Full-bleed parallax video background.
 * The video playhead is bound 1:1 to `scrollY` so the clip
 * scrubs forward / backward as the user scrolls.
 */
export function HiggsfieldVideoScrubber({
  scrollY,
  videoSource,
  sectionHeight = VIDEO_SECTION_HEIGHT,
}: HiggsfieldVideoScrubberProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Resolve the local video asset path
  const resolvedSource = (() => {
    if (videoSource) return videoSource;
    // On web, Expo serves files from the public/ directory at the root URL
    if (Platform.OS === 'web') return '/pregnant-woman-cpap.mp4';
    try {
      const asset = require('@/assets/videos/pregnant-woman-cpap.mp4');
      if (typeof asset === 'string') return asset;
      if (asset?.uri) return asset.uri;
      return asset;
    } catch {
      return undefined;
    }
  })();

  // Bind window.scrollY → video.currentTime on web
  useEffect(() => {
    if (Platform.OS !== 'web' || !videoRef.current || duration === 0) return;

    const handleScrollSync = () => {
      if (!videoRef.current || duration === 0) return;
      const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
      // Map [0 → sectionHeight] of scroll to [0 → duration] of video
      const ratio = Math.max(0, Math.min(1, currentScroll / sectionHeight));
      videoRef.current.currentTime = ratio * duration;
    };

    window.addEventListener('scroll', handleScrollSync, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSync);
  }, [duration, sectionHeight]);

  // Parallax: video moves at 0.4× scroll speed for depth illusion
  const videoParallaxStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, sectionHeight],
      [0, sectionHeight * 0.4],
      Extrapolation.CLAMP,
    );
    const scale = interpolate(
      scrollY.value,
      [0, sectionHeight],
      [1, 1.15],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Gradient overlay fades in as user scrolls past the video
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [0, sectionHeight * 0.3, sectionHeight * 0.7],
      [0.35, 0.5, 0.85],
      Extrapolation.CLAMP,
    ),
  }));

  // Progress scrub bar at bottom of video section
  const progressBarStyle = useAnimatedStyle(() => {
    const pct = interpolate(scrollY.value, [0, sectionHeight], [0, 100], Extrapolation.CLAMP);
    return { width: `${pct}%` };
  });

  return (
    <View style={[styles.section, { height: sectionHeight }]}>
      {/* Parallax-shifted video layer */}
      <Animated.View style={[styles.videoLayer, videoParallaxStyle]}>
        {Platform.OS === 'web' && resolvedSource ? (
          <video
            ref={videoRef}
            playsInline
            muted
            preload="auto"
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration);
            }}
            src={resolvedSource}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : (
          <View style={[styles.fallback, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
              Video background ready
            </Text>
          </View>
        )}
      </Animated.View>

      {/* Dark gradient overlay for text legibility */}
      <Animated.View style={[styles.gradientOverlay, overlayStyle, { pointerEvents: 'none' }]} />

      {/* Bottom gradient for smooth transition into content below */}
      <View style={[styles.bottomFade, { pointerEvents: 'none' }]} />

      {/* Scroll-scrub timeline indicator */}
      <View style={styles.scrubBarContainer}>
        <View style={styles.scrubBarTrack}>
          <Animated.View style={[styles.scrubBarFill, { backgroundColor: Colors.light.primary }, progressBarStyle]} />
        </View>
        <Text style={styles.scrubBarLabel}>Scroll to explore ↕</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  videoLayer: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    bottom: -60,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    // Use a solid dark band at the bottom edge for a smooth blend into content
    backgroundColor: 'transparent',
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
  },
  scrubBarContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    gap: 6,
    padding: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  scrubBarTrack: {
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
  },
  scrubBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  scrubBarLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
