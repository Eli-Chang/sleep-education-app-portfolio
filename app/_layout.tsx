import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
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
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
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
    'Newsreader-SemiBold': require('../assets/fonts/Newsreader-SemiBold.ttf'),
    'Newsreader-Medium': require('../assets/fonts/Newsreader-Medium.ttf'),
    Atkinson: require('../assets/fonts/AtkinsonHyperlegibleNext-Regular.ttf'),
    'Atkinson-Bold': require('../assets/fonts/AtkinsonHyperlegibleNext-Bold.ttf'),
  });
  if (!fontsLoaded) return null;
  return <SafeAreaProvider><AppProvider><VelaNudgeProvider>
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style="dark" />
      <ThemeProvider value={navigationTheme}>
        <WebDocumentTitle />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="module/[id]" />
          <Stack.Screen name="module/[id]/complete" />
          <Stack.Screen name="lesson/[moduleId]/index" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="lesson/[moduleId]/[screenId]" options={{ animation: 'none' }} />
          <Stack.Screen name="about" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings/voice-lab" />
          <Stack.Screen name="ai" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'transparent' } }} />
        </Stack>
      </ThemeProvider>
      <VelaChrome />
    </View>
  </VelaNudgeProvider></AppProvider></SafeAreaProvider>;
}
