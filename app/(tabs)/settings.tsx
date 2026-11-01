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
import { fontFamily, palette, radius, spacing, touchTarget, type as typeScale } from '@/src/theme/tokens';
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

  const es = state.language === 'es';
  return <TabRouteBoundary><AppScreen contentStyle={styles.content}>
    <Header title={t('settings')} subtitle={es ? 'Preferencias guardadas en este dispositivo.' : 'Preferences saved on this device.'} />
    <Card>
      <SettingHeading icon="translate" title={t('language')} />
      {deviceLanguage === 'es' && state.language === 'en' ? <Text style={styles.help}>Español está disponible. You can switch without losing progress.</Text> : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={t('language')} style={styles.segment}>
        {([['en', 'English'], ['es', 'Español']] as const).map(([locale, label]) => <Pressable key={locale} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{ selected: state.language === locale }} aria-checked={state.language === locale} onPress={() => changeLanguage(locale)} style={[styles.segmentButton, state.language === locale && styles.segmentActive]}>{state.language === locale ? <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check" size={18} color={palette.primary} /> : null}<Text style={[styles.segmentText, state.language === locale && styles.segmentTextActive]}>{label}</Text></Pressable>)}
      </View>
    </Card>
    <Card>
      <View style={styles.settingRow}><View style={styles.settingCopy}><SettingHeading icon="volume-high" title={t('narration')} /><Text style={styles.help}>{es ? 'Usa una voz en español instalada en su dispositivo.' : 'Uses a compatible voice installed on your device.'}</Text></View><Switch accessibilityLabel={t('narration')} value={state.narrationEnabled} onValueChange={(enabled) => { if (!enabled) void stopNarration(); setNarrationEnabled(enabled); }} trackColor={{ false: palette.borderStrong, true: palette.primary }} thumbColor={palette.white} /></View>
      <View style={styles.divider} />
      <View style={styles.valueHeading}><Text style={styles.label}>{t('narrationRate')}</Text><Text style={styles.value}>{state.narrationRate.toFixed(1)}×</Text></View>
      <ValueControl value={state.narrationRate} min={0.6} max={1.2} onChange={setNarrationRate} label={es ? 'velocidad de narración' : 'narration speed'} decreaseLabel={t('decrease')} increaseLabel={t('increase')} />
      <View style={styles.valueHeading}><Text style={styles.label}>{t('pitch')}</Text><Text style={styles.value}>{state.narrationPitch.toFixed(1)}</Text></View>
      <ValueControl value={state.narrationPitch} min={0.7} max={1.3} onChange={setNarrationPitch} label={es ? 'tono de narración' : 'narration pitch'} decreaseLabel={t('decrease')} increaseLabel={t('increase')} />
      <Text style={styles.help}>{es ? 'La narración no usará una voz inglesa como alternativa.' : 'Higher-quality en-US voices are preferred when available.'}</Text>
    </Card>
    <Card><View style={styles.settingRow}><View style={styles.settingCopy}><SettingHeading icon="human" title={t('accessibility')} /><Text style={styles.help}>{t('reducedMotionBody')}</Text></View><Switch accessibilityLabel={t('reducedMotion')} value={state.reduceMotion} onValueChange={setReduceMotion} trackColor={{ false: palette.borderStrong, true: palette.primary }} thumbColor={palette.white} /></View></Card>
    <Card><View style={styles.settingRow}><View style={styles.settingCopy}><Text style={styles.label}>{t('aiTools')}</Text><Text style={styles.help}>{t('aiOptionalFeedback')}</Text></View><Switch accessibilityLabel={t('aiFeatures')} value={state.aiEnabled} onValueChange={setAiEnabled} trackColor={{ false: palette.border, true: palette.primary }} /></View>
      <ActionButton variant="secondary" label={t('aiTools')} icon="comment-text-outline" disabled={!state.aiEnabled} onPress={() => router.push({ pathname: '/ai', params: { returnTo: '/settings' } } as Href)} />
      <ActionButton variant="secondary" label={t('revokeAiConsent')} icon="shield-off-outline" disabled={!state.aiConsent} onPress={() => setAiConsent(false)} />
      <Text style={styles.help}>{state.aiConsent ? (state.language === 'es' ? 'El consentimiento está activo. Puede retirarlo cuando quiera.' : 'Consent is active. You can withdraw it at any time.') : (state.aiEnabled ? (state.language === 'es' ? 'Debe dar su consentimiento la primera vez que abra Vela.' : 'Consent is required the first time you open Vela.') : '')}</Text>
    </Card>
    <Card><Text style={styles.label}>{t('velaPrivacy')}</Text><Text style={styles.help}>{t('velaConsentBody')}</Text><Text style={styles.help}>{t('velaConsentData')}</Text><View style={styles.privacyActions}><ActionButton variant="secondary" label={t('privacyDetails')} icon="shield-lock-outline" onPress={() => router.push('/about' as Href)} /><ActionButton variant="secondary" label={t('clearVelaConversation')} icon="broom" onPress={clearVelaConversation} /></View>{!state.aiEnabled ? <Text style={styles.help}>{t('aiDisabled')}</Text> : null}</Card>
    <Pressable accessibilityRole="button" accessibilityLabel={t('about')} onPress={() => router.push('/about' as Href)} style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}>
      <View style={styles.iconTile}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="information-outline" size={20} color={palette.primary} /></View>
      <Text style={styles.linkText}>{t('about')}</Text>
      <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="chevron-right" size={22} color={palette.inkMuted} />
    </Pressable>
    <View style={styles.destructiveSection}><View style={styles.destructiveHeading}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="alert-outline" size={21} color={palette.danger} /><Text accessibilityRole="header" style={styles.destructiveTitle}>{es ? 'Datos de aprendizaje' : 'Learning data'}</Text></View><Text style={styles.help}>{es ? 'Borre su progreso y respuestas guardadas en este dispositivo. Sus preferencias se conservarán.' : 'Clear saved progress and answers on this device. Your preferences will be kept.'}</Text><ActionButton variant="danger" label={t('reset')} icon="delete-outline" onPress={confirmReset} />{resetOpen ? <View accessibilityRole="alert" style={styles.resetDialog}><Text accessibilityRole="header" style={styles.label}>{t('resetTitle')}</Text><Text style={styles.help}>{t('resetBody')}</Text><View style={styles.dialogActions}><ActionButton variant="secondary" label={t('cancel')} onPress={() => setResetOpen(false)} /><ActionButton variant="danger" label={t('confirmReset')} onPress={applyReset} /></View></View> : null}</View>
  </AppScreen></TabRouteBoundary>;
}

function SettingHeading({ icon, title }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string }) {
  return <View style={styles.settingHeading}><View style={styles.iconTile}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={icon} size={20} color={palette.primary} /></View><Text accessibilityRole="header" style={styles.heading}>{title}</Text></View>;
}

function ValueControl({ value, min, max, onChange, label, decreaseLabel, increaseLabel }: { value: number; min: number; max: number; onChange: (value: number) => void; label: string; decreaseLabel: string; increaseLabel: string }) {
  return <View style={styles.rateRow}><Pressable accessibilityRole="button" accessibilityLabel={`${decreaseLabel} ${label}`} onPress={() => onChange(Math.max(min, Number((value - 0.1).toFixed(1))))} style={styles.rateButton}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="minus" size={22} color={palette.primary} /></Pressable><View style={styles.rateTrack}><View style={[styles.rateFill, { width: `${((value - min) / (max - min)) * 100}%` }]} /></View><Pressable accessibilityRole="button" accessibilityLabel={`${increaseLabel} ${label}`} onPress={() => onChange(Math.min(max, Number((value + 0.1).toFixed(1))))} style={styles.rateButton}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="plus" size={22} color={palette.primary} /></Pressable></View>;
}

const styles = StyleSheet.create({
  content: { gap: 16 },
  heading: { ...typeScale.section, fontSize: 20, lineHeight: 25, color: palette.ink },
  settingHeading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconTile: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  label: { ...typeScale.label, color: palette.ink },
  value: { ...typeScale.label, color: palette.primary },
  valueHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  help: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  divider: { height: 1, backgroundColor: palette.border },
  segment: { flexDirection: 'row', padding: 4, gap: 4, borderRadius: radius.pill, backgroundColor: palette.sunken },
  segmentButton: { flex: 1, minHeight: touchTarget, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  segmentActive: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.primary },
  segmentText: { color: palette.body, fontFamily: fontFamily.body, fontSize: 16 },
  segmentTextActive: { color: palette.primary, fontFamily: fontFamily.bodyBold, fontWeight: 'normal' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, settingCopy: { flex: 1, gap: 8 },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md }, rateButton: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: palette.borderStrong, borderRadius: touchTarget / 2, backgroundColor: palette.surface },
  rateTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: palette.sunken, overflow: 'hidden' }, rateFill: { height: '100%', backgroundColor: palette.primary },
  linkRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  linkText: { flex: 1, ...typeScale.label, color: palette.ink },
  pressed: { opacity: 0.8 },
  privacyActions: { gap: spacing.sm },
  destructiveSection: { gap: spacing.md, padding: 20, borderWidth: 1, borderColor: 'rgba(174,55,39,0.35)', borderRadius: radius.lg, backgroundColor: palette.dangerSoft },
  destructiveHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  destructiveTitle: { color: palette.danger, fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 17 },
  resetDialog: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.warning, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md }, dialogActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
