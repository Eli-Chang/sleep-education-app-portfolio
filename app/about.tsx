import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppScreen, Card, Header } from '@/src/components/ui';
import { palette, spacing, touchTarget } from '@/src/theme/tokens';

export default function AboutScreen() {
  const { t, i18n } = useTranslation();
  return <AppScreen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('close')} onPress={() => router.back()} style={styles.close}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="close" size={26} color={palette.primaryDark} /></Pressable>
    <Header title={t('about')} subtitle={i18n.language === 'es' ? 'Aplicación educativa sin cuentas, anuncios ni seguimiento.' : 'An education app with no accounts, ads, or tracking.'} />
    <Card><Text style={styles.heading}>{i18n.language === 'es' ? 'Aviso educativo' : 'Educational disclaimer'}</Text><Text style={styles.body}>{t('educationalDisclaimer')}</Text></Card>
    <Card><Text style={styles.heading}>{i18n.language === 'es' ? 'Privacidad y conexión' : 'Privacy & offline use'}</Text><Text style={styles.body}>{i18n.language === 'es' ? 'El contenido, el progreso y las preferencias permanecen en el dispositivo. No se recopilan datos personales de salud. El contenido escrito funciona sin conexión. La narración depende de las voces instaladas.' : 'Content, progress, and preferences stay on this device. No personal health information is collected. Written content works offline. Narration depends on installed system voices.'}</Text></Card>
    <Text style={styles.version}>Sleep Education · Development build 1.0.0</Text>
  </AppScreen>;
}
const styles = StyleSheet.create({ close: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }, heading: { color: palette.ink, fontSize: 18, fontWeight: '800' }, body: { color: palette.inkMuted, fontSize: 16, lineHeight: 25 }, version: { color: palette.inkMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.lg } });
