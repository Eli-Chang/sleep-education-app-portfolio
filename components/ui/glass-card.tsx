import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'primary' | 'accent' | 'outlined';
  enable3DTilt?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function GlassCard({ children, style, variant = 'default', enable3DTilt = true }: GlassCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primaryLight,
          borderColor: colors.primary,
        };
      case 'accent':
        return {
          backgroundColor: colors.accentLight,
          borderColor: colors.accent,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.cardBorder,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
        };
    }
  };

  const handlePressIn = () => {
    if (enable3DTilt) {
      rotateX.value = withSpring(-3, { damping: 12 });
      rotateY.value = withSpring(3, { damping: 12 });
      scale.value = withSpring(0.98, { damping: 14 });
    }
  };

  const handlePressOut = () => {
    if (enable3DTilt) {
      rotateX.value = withSpring(0, { damping: 14 });
      rotateY.value = withSpring(0, { damping: 14 });
      scale.value = withSpring(1, { damping: 14 });
    }
  };

  const animatedTiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        getVariantStyle(),
        Platform.OS === 'web'
          ? { boxShadow: `0px 8px 16px ${colors.shadowColor}14` }
          : { shadowColor: colors.shadowColor },
        animatedTiltStyle,
        style,
      ]}>
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    elevation: 4,
  },
});
