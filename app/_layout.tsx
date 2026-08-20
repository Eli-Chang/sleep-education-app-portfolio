import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import 'react-native-reanimated';
import '@/src/i18n';
import { AppProvider } from '@/src/state/AppProvider';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { View } from 'react-native';
import { VelaChrome, VelaNudgeProvider } from '@/src/components/VelaMascot';
import { WebDocumentTitle } from '@/src/components/WebDocumentTitle';
import { palette } from '@/src/theme/tokens';

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.primary,
    background: 'transparent',
    card: 'transparent',
    text: palette.ink,
    border: palette.border,
    notification: palette.danger,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque: require('../assets/fonts/BricolageGrotesque-Variable.ttf'),
    Karla: require('../assets/fonts/Karla-Variable.ttf'),
  });
  if (!fontsLoaded) return null;
  return <SafeAreaProvider><AppProvider><VelaNudgeProvider>
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style="light" />
      <ThemeProvider value={navigationTheme}>
        <WebDocumentTitle />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="module/[id]" />
          <Stack.Screen name="module/[id]/complete" />
          <Stack.Screen name="lesson/[moduleId]/[screenId]" />
          <Stack.Screen name="about" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings/voice-lab" />
          <Stack.Screen name="ai" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'transparent' } }} />
        </Stack>
      </ThemeProvider>
      <VelaChrome />
    </View>
  </VelaNudgeProvider></AppProvider></SafeAreaProvider>;
}
