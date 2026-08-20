import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getModules, getModule } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { ActionButton, AppScreen, ProgressMeter, StatusPill } from '@/src/components/ui';
import { chooseVoice, speakScreen, stopNarration } from '@/src/services/narration';
import { fontFamily, palette, radius, spacing } from '@/src/theme/tokens';

export default function ModuleCompletionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { state } = useApp();
  const module = getModule(state.language, id);
  const modules = getModules(state.language);
  const next = module ? modules.find((candidate) => candidate.order === module.order + 1) : undefined;
  const lastScreen = module?.screens.at(-1);

  useEffect(() => () => { void stopNarration(); }, []);

  if (!module) return <AppScreen><Text style={styles.title}>{t('moduleComplete')}</Text></AppScreen>;

  const continueFromCompletion = () => {
    if (next) router.replace(`/module/${next.id}` as Href);
    else router.replace('/' as Href);
  };
  const listen = async () => {
    if (!lastScreen || !state.narrationEnabled) return;
    const voice = await chooseVoice(state.language, state.voiceByLocale[state.language]);
    if (voice) await speakScreen(lastScreen, state.language, state.narrationRate, voice, state.narrationPitch);
  };
  const continueLabel = next ? t('continueToNextModule', { module: next.shortTitle }) : t('backToModules');

  return <AppScreen contentStyle={styles.lessonContent}>
    <View style={styles.topRow}>
      <Pressable accessibilityRole="button" accessibilityLabel={`${t('backToModule')}: ${module.shortTitle}`} onPress={() => router.replace(`/module/${module.id}` as Href)} style={({ pressed }) => [styles.back, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="arrow-left" size={20} color={palette.ink} />
        <Text style={styles.backModule}>{module.shortTitle}</Text>
      </Pressable>
      <Text style={styles.step}>{state.language === 'es' ? 'Completar' : 'Complete'}</Text>
    </View>
    <ProgressMeter compact value={100} label={state.language === 'es' ? 'Módulo completado' : 'Module complete'} />
    <View style={styles.controls}>
      <ActionButton wrapperStyle={styles.controlSlot} buttonStyle={styles.controlButton} variant="secondary" label={t('previous')} icon="arrow-left" iconColor={palette.body} textColor={palette.body} textStyle={styles.controlText} onPress={() => lastScreen ? router.replace(`/lesson/${module.id}/${lastScreen.id}` as Href) : router.replace(`/module/${module.id}` as Href)} />
      <ActionButton wrapperStyle={styles.controlNarration} buttonStyle={styles.controlButton} variant="primary" label={state.language === 'es' ? 'Escuchar' : 'Listen'} icon="volume-high" iconColor={palette.onPrimary} textStyle={styles.narrationText} disabled={!state.narrationEnabled} onPress={() => void listen()} />
      <ActionButton wrapperStyle={styles.controlSlot} buttonStyle={styles.controlButton} label={state.language === 'es' ? 'Completar' : 'Complete'} icon="check" iconPosition="trailing" textStyle={styles.controlText} onPress={continueFromCompletion} />
    </View>
    <View style={styles.hero}>
      <View testID="completion-check" style={styles.check}><MaterialCommunityIcons name="check" size={46} color={palette.onPrimary} /></View>
      <Text accessibilityRole="header" style={styles.title}>{t('moduleComplete')}</Text>
      <Text style={styles.subtitle}>{module.title}</Text>
    </View>
    <View style={styles.statusCard}>
      <Text style={styles.label}>{state.language === 'es' ? `MÓDULO ${module.order} COMPLETADO` : `MODULE ${module.order} COMPLETE`}</Text>
      <StatusPill complete label={t('completed')} />
      <Text style={styles.savedCopy}>{t('completionSaved')}</Text>
    </View>
    <ActionButton label={continueLabel} icon={next ? 'arrow-right' : 'home-outline'} iconPosition="trailing" onPress={continueFromCompletion} />
    {next ? <ActionButton label={t('backToModules')} icon="home-outline" variant="secondary" onPress={() => router.replace('/' as Href)} /> : null}
    <ActionButton label={t('reviewCompletion')} icon="book-open-outline" variant="secondary" onPress={() => router.replace(`/module/${module.id}` as Href)} />
  </AppScreen>;
}

const styles = StyleSheet.create({
  lessonContent: { gap: 12, paddingTop: Platform.OS === 'web' ? 54 : 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  back: { width: 132, maxWidth: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 0, paddingLeft: 16, borderRadius: radius.sm },
  backModule: { color: palette.ink, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 18, fontWeight: '600' },
  step: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  controls: { flexDirection: 'row', gap: 6, alignItems: 'stretch' },
  controlSlot: { flex: 1, minWidth: 0 },
  controlNarration: { flex: 0.68, minWidth: 0 },
  controlButton: { width: '100%', minWidth: 0, paddingHorizontal: 4 },
  controlText: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  narrationText: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  hero: { alignItems: 'center', gap: spacing.sm, paddingTop: 18, paddingBottom: 8 },
  check: { width: 92, height: 92, borderRadius: 46, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.success },
  title: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 29, lineHeight: 36, fontWeight: '900', letterSpacing: -0.4, textAlign: 'center' },
  subtitle: { color: palette.body, fontFamily: fontFamily.body, fontSize: 17, lineHeight: 27, textAlign: 'center' },
  statusCard: { gap: spacing.md, borderWidth: 1, borderColor: palette.success, borderRadius: 22, padding: 18, backgroundColor: palette.successSoft },
  label: { color: palette.success, fontFamily: fontFamily.body, fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  pointText: { flex: 1, color: palette.body, fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24 },
  savedCopy: { color: palette.body, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 21 },
  pressed: { opacity: 0.72 },
});
