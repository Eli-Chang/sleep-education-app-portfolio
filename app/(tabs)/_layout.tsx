import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fontFamily, palette } from '@/src/theme/tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ name, focused, color }: { name: keyof typeof MaterialCommunityIcons.glyphMap; focused: boolean; color: string }) {
  return <View style={[styles.iconPill, focused && styles.iconPillActive]}>
    <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={name} color={color} size={23} />
  </View>;
}

export default function TabLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return <Tabs screenOptions={{
    headerShown: false, tabBarLabelPosition: 'below-icon', tabBarActiveTintColor: palette.primary, tabBarInactiveTintColor: palette.inkMuted,
    tabBarStyle: { height: 74 + insets.bottom, paddingTop: 8, paddingBottom: Math.max(10, insets.bottom), backgroundColor: palette.surface, borderTopColor: palette.border, borderTopWidth: 1 },
    tabBarLabelStyle: { fontSize: 13, fontFamily: fontFamily.bodyBold, fontWeight: 'normal', marginTop: 2 },
  }}>
    <Tabs.Screen name="index" options={{ title: t('home'), tabBarAccessibilityLabel: t('home'), tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'home-variant' : 'home-variant-outline'} focused={focused} color={color} /> }} />
    <Tabs.Screen name="explore" options={{ href: null }} />
    <Tabs.Screen name="settings" options={{ title: t('settings'), tabBarAccessibilityLabel: t('settings'), tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'cog' : 'cog-outline'} focused={focused} color={color} /> }} />
  </Tabs>;
}

const styles = StyleSheet.create({
  iconPill: { width: 58, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconPillActive: { backgroundColor: palette.primarySoft },
});
