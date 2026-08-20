import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AirflowParticles() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const flow1 = useSharedValue(-100);
  const flow2 = useSharedValue(-100);
  const flow3 = useSharedValue(-100);

  useEffect(() => {
    flow1.value = withRepeat(
      withTiming(300, { duration: 1800, easing: Easing.linear }),
      -1,
      false
    );
    flow2.value = withRepeat(
      withSequence(
        withTiming(300, { duration: 2400, easing: Easing.linear }),
        withTiming(-100, { duration: 0 })
      ),
      -1,
      false
    );
    flow3.value = withRepeat(
      withTiming(300, { duration: 2100, easing: Easing.linear }),
      -1,
      false
    );
  }, [flow1, flow2, flow3]);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ translateX: flow1.value }, { rotate: '-12deg' }],
    opacity: 0.6,
  }));
  const style2 = useAnimatedStyle(() => ({
    transform: [{ translateX: flow2.value }, { rotate: '-12deg' }],
    opacity: 0.4,
  }));
  const style3 = useAnimatedStyle(() => ({
    transform: [{ translateX: flow3.value }, { rotate: '-12deg' }],
    opacity: 0.8,
  }));

  return (
    <View style={[styles.container, { pointerEvents: 'none' }]}>
      <Animated.View style={[styles.particle, { backgroundColor: colors.accent, top: 12 }, style1]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors.primary, top: 32 }, style2]} />
      <Animated.View style={[styles.particle, { backgroundColor: colors.secondary, top: 52 }, style3]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    left: 0,
    width: 60,
    height: 4,
    borderRadius: 2,
  },
});
