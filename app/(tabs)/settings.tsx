import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { getLocales } from 'expo-localization';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ActionButton, AppScreen, Card, Header } from '@/src/components/ui';
import { TabRouteBoundary } from '@/src/components/TabRouteBoundary';
import { useApp } from '@/src/state/AppProvider';
import { stopNarration } from '@/src/services/narration';
import { useVelaNudgeSuppression } from '@/src/components/VelaMascot';
import { fontFamily, palette, radius, spacing, touchTarget } from '@/src/theme/tokens';
import type { SupportedLocale } from '@/src/types/content';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { state, setLanguage, setNarrationEnabled, setNarrationRate, setNarrationPitch, setReduceMotion, setAiConsent, setAiEnabled, clearVelaConversation, resetProgress } = useApp();
  const [resetOpen, setResetOpen] = useState(false);
  useVelaNudgeSuppression('settings-reset-dialog', resetOpen);
  const deviceLanguage = getLocales()[0]?.languageCode;
  const changeLanguage = (language: SupportedLocale) => { void stopNarration(); setLanguage(language); };
  const confirmReset = () => setResetOpen(true);
  const applyReset = () => { resetProgress(); setResetOpen(false); };

  return <TabRouteBoundary><AppScreen>
    <Header title={t('settings')} subtitle={state.language === 'es' ? 'Preferencias guardadas en este dispositivo.' : 'Preferences saved on this device.'} />
    <Card><Text style={styles.label}>{t('language')}</Text>{deviceLanguage === 'es' && state.language === 'en' ? <Text style={styles.help}>Español está disponible. You can switch without losing progress.</Text> : null}<View style={styles.segment}>
      {([['en', 'English'], ['es', 'Español']] as const).map(([locale, label]) => <Pressable key={locale} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected: state.language === locale }} aria-checked={state.language === locale} onPress={() => changeLanguage(locale)} style={[styles.segmentButton, state.language === locale && styles.segmentActive]}><Text style={[styles.segmentText, state.language === locale && styles.segmentTextActive]}>{label}</Text></Pressable>)}
    </View></Card>
    <Card><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.label}>{t('narration')}</Text><Text style={styles.help}>{state.language === 'es' ? 'Usa una voz en español instalada en su dispositivo.' : 'Uses a compatible voice installed on your device.'}</Text></View><Switch accessibilityLabel={t('narration')} value={state.narrationEnabled} onValueChange={(enabled) => { if (!enabled) void stopNarration(); setNarrationEnabled(enabled); }} trackColor={{ false: palette.border, true: palette.primary }} /></View>
      <Text style={styles.label}>{t('narrationRate')}: {state.narrationRate.toFixed(1)}×</Text>
      <ValueControl value={state.narrationRate} min={0.6} max={1.2} onChange={setNarrationRate} label={state.language === 'es' ? 'velocidad de narración' : 'narration speed'} decreaseLabel={t('decrease')} increaseLabel={t('increase')} />
      <Text style={styles.label}>{t('pitch')}: {state.narrationPitch.toFixed(1)}</Text>
      <ValueControl value={state.narrationPitch} min={0.7} max={1.3} onChange={setNarrationPitch} label={state.language === 'es' ? 'tono de narración' : 'narration pitch'} decreaseLabel={t('decrease')} increaseLabel={t('increase')} />
      <Text style={styles.help}>{state.language === 'es' ? 'La narración no usará una voz inglesa como alternativa.' : 'Higher-quality en-US voices are preferred when available.'}</Text>
    </Card>
    <Card><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.label}>{t('accessibility')}</Text><Text style={styles.help}>{t('reducedMotionBody')}</Text></View><Switch accessibilityLabel={t('reducedMotion')} value={state.reduceMotion} onValueChange={setReduceMotion} trackColor={{ false: palette.border, true: palette.primary }} /></View></Card>
    <Card><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.label}>{t('aiTools')}</Text><Text style={styles.help}>{t('aiOptionalFeedback')}</Text></View><Switch accessibilityLabel={t('aiFeatures')} value={state.aiEnabled} onValueChange={setAiEnabled} trackColor={{ false: palette.border, true: palette.primary }} /></View>
      <ActionButton variant="secondary" label={t('aiTools')} icon="comment-text-outline" disabled={!state.aiEnabled} onPress={() => router.push({ pathname: '/ai', params: { returnTo: '/settings' } } as Href)} />
      <ActionButton variant="secondary" label={t('revokeAiConsent')} icon="shield-off-outline" disabled={!state.aiConsent} onPress={() => setAiConsent(false)} />
      <Text style={styles.help}>{state.aiConsent ? (state.language === 'es' ? 'El consentimiento está activo. Puede retirarlo cuando quiera.' : 'Consent is active. You can withdraw it at any time.') : (state.aiEnabled ? (state.language === 'es' ? 'Debe dar su consentimiento la primera vez que abra Vela.' : 'Consent is required the first time you open Vela.') : '')}</Text>
    </Card>
    <Card><Text style={styles.label}>{t('velaPrivacy')}</Text><Text style={styles.help}>{t('velaConsentBody')}</Text><Text style={styles.help}>{t('velaConsentData')}</Text><View style={styles.privacyActions}><ActionButton variant="secondary" label={t('privacyDetails')} icon="shield-lock-outline" onPress={() => router.push('/about' as Href)} /><ActionButton variant="secondary" label={t('clearVelaConversation')} icon="broom" onPress={clearVelaConversation} /></View>{!state.aiEnabled ? <Text style={styles.help}>{t('aiDisabled')}</Text> : null}</Card>
    <Card><ActionButton variant="secondary" label={t('about')} icon="information-outline" onPress={() => router.push('/about' as Href)} /></Card>
    <View style={styles.destructiveSection}><View style={styles.destructiveHeading}><MaterialCommunityIcons name="alert-outline" size={21} color={palette.danger} /><Text style={styles.destructiveTitle}>{state.language === 'es' ? 'Datos de aprendizaje' : 'Learning data'}</Text></View><Text style={styles.help}>{state.language === 'es' ? 'Borre su progreso y respuestas guardadas en este dispositivo. Sus preferencias se conservarán.' : 'Clear saved progress and answers on this device. Your preferences will be kept.'}</Text><ActionButton variant="danger" label={t('reset')} icon="delete-outline" onPress={confirmReset} />{resetOpen ? <View accessibilityRole="alert" style={styles.resetDialog}><Text accessibilityRole="header" style={styles.label}>{t('resetTitle')}</Text><Text style={styles.help}>{t('resetBody')}</Text><View style={styles.dialogActions}><ActionButton variant="secondary" label={t('cancel')} onPress={() => setResetOpen(false)} /><ActionButton variant="danger" label={t('confirmReset')} onPress={applyReset} /></View></View> : null}</View>
  </AppScreen></TabRouteBoundary>;
}

function ValueControl({ value, min, max, onChange, label, decreaseLabel, increaseLabel }: { value: number; min: number; max: number; onChange: (value: number) => void; label: string; decreaseLabel: string; increaseLabel: string }) {
  return <View style={styles.rateRow}><Pressable accessibilityRole="button" accessibilityLabel={`${decreaseLabel} ${label}`} onPress={() => onChange(Math.max(min, Number((value - 0.1).toFixed(1))))} style={styles.rateButton}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="minus" size={24} color={palette.primaryDark} /></Pressable><View style={styles.rateTrack}><View style={[styles.rateFill, { width: `${((value - min) / (max - min)) * 100}%` }]} /></View><Pressable accessibilityRole="button" accessibilityLabel={`${increaseLabel} ${label}`} onPress={() => onChange(Math.min(max, Number((value + 0.1).toFixed(1))))} style={styles.rateButton}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="plus" size={24} color={palette.primaryDark} /></Pressable></View>;
}

const styles = StyleSheet.create({
  label: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 17, fontWeight: '800' }, help: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 21 },
  segment: { flexDirection: 'row', padding: 4, borderRadius: radius.md, backgroundColor: palette.surfaceSoft },
  segmentButton: { flex: 1, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  segmentActive: { backgroundColor: palette.surface }, segmentText: { color: palette.inkMuted, fontWeight: '700' }, segmentTextActive: { color: palette.primaryDark, fontWeight: '900' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, settingCopy: { flex: 1, gap: 4 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, rateButton: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.border, borderRadius: radius.md },
  rateTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: palette.border, overflow: 'hidden' }, rateFill: { height: '100%', backgroundColor: palette.primary },
  destructiveSection: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: palette.danger, borderRadius: radius.lg, backgroundColor: palette.dangerSoft },
  privacyActions: { gap: spacing.sm },
  destructiveHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  destructiveTitle: { color: palette.danger, fontSize: 17, fontWeight: '900' },
  resetDialog: { backgroundColor: palette.warningSoft, borderWidth: 1, borderColor: palette.warning, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md }, dialogActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
