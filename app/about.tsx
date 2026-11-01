import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppScreen, Card, Header, IconButton } from '@/src/components/ui';
import { fontFamily, palette, type as typeScale } from '@/src/theme/tokens';

export default function AboutScreen() {
  const { t, i18n } = useTranslation();
  const es = i18n.language === 'es';
  return <AppScreen>
    <View style={styles.closeRow}><IconButton icon="close" accessibilityLabel={t('close')} onPress={() => router.back()} /></View>
    <Header title={t('about')} subtitle={es ? 'Aplicación educativa sin cuentas, anuncios ni seguimiento.' : 'An education app with no accounts, ads, or tracking.'} />
    <Card><View style={styles.headingRow}><View style={styles.iconTile}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="school-outline" size={20} color={palette.primary} /></View><Text accessibilityRole="header" style={styles.heading}>{es ? 'Aviso educativo' : 'Educational disclaimer'}</Text></View><Text style={styles.body}>{t('educationalDisclaimer')}</Text></Card>
    <Card><View style={styles.headingRow}><View style={styles.iconTile}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="shield-lock-outline" size={20} color={palette.primary} /></View><Text accessibilityRole="header" style={styles.heading}>{es ? 'Privacidad y conexión' : 'Privacy & offline use'}</Text></View><Text style={styles.body}>{t('aboutPrivacyBody')}</Text></Card>
    <Text style={styles.version}>Sleep Education · Development build 1.0.0</Text>
  </AppScreen>;
}
const styles = StyleSheet.create({
  closeRow: { alignItems: 'flex-end' },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  heading: { ...typeScale.section, fontSize: 20, lineHeight: 25, color: palette.ink, flex: 1 },
  body: { ...typeScale.body, fontSize: 17, lineHeight: 26, color: palette.body },
  version: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 13.5, textAlign: 'center', marginTop: 8 },
});
