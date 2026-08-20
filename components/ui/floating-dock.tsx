import { Platform, Pressable, StyleSheet, Text } from 'react-native';
import { router, usePathname, type Href } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHaptics } from '@/hooks/use-haptics';

export function FloatingDock() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const pathname = usePathname();
  const { triggerSelection } = useHaptics();

  const navItems: { label: string; icon: string; route: Href }[] = [
    { label: 'Learn', icon: 'L', route: '/' as Href },
    { label: 'Library', icon: 'R', route: '/explore' as Href },
    { label: 'Checklist', icon: 'C', route: '/modal' as Href },
  ];

  return (
    <Animated.View
      entering={FadeInUp.delay(200).duration(400)}
      style={[
        styles.dockContainer,
        { backgroundColor: colors.glassBackground, borderColor: colors.glassBorder },
        Platform.OS === 'web'
          ? { boxShadow: `0px 8px 20px ${colors.shadowColor}26` }
          : { shadowColor: colors.shadowColor },
      ]}>
      {navItems.map((item) => {
        const isActive = pathname === item.route;
        return (
          <Pressable
            key={item.label}
            onPress={() => {
              triggerSelection();
              router.push(item.route);
            }}
            style={[
              styles.dockItem,
              {
                backgroundColor: isActive ? colors.primaryLight : 'transparent',
              },
            ]}>
            <Text style={styles.dockIcon}>{item.icon}</Text>
            <Text style={[styles.dockLabel, { color: isActive ? colors.primaryDark : colors.textMuted }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dockContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
    elevation: 10,
    zIndex: 100,
  },
  dockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    gap: 6,
  },
  dockIcon: {
    fontSize: 16,
  },
  dockLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
});
