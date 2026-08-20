import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getModule } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { stopNarration } from '@/src/services/narration';
import { moduleProgress } from '@/src/utils/progress';
import { ActionButton, AppScreen, Card, GradientSurface, Header } from '@/src/components/ui';
import { fontFamily, palette, radius, spacing, touchTarget } from '@/src/theme/tokens';

export default function ModuleOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { state, saveNow } = useApp();
  const [backFocused, setBackFocused] = useState(false);
  const module = getModule(state.language, id);
  if (!module) return <AppScreen><Header title={state.language === 'es' ? 'Módulo no encontrado' : 'Module not found'} /><ActionButton label={t('backToModules')} icon="arrow-left" onPress={() => router.replace('/' as Href)} /></AppScreen>;

  const progress = moduleProgress(module, state.completedScreenIds);
  const startScreen = module.screens.find((screen) => !state.completedScreenIds.includes(screen.id)) ?? module.screens[0];
  const action = progress.percentage === 100 ? t('review') : progress.percentage > 0 ? t('continue') : t('start');
  const nextIndex = Math.max(0, module.screens.findIndex((screen) => screen.id === startScreen.id));

  return <AppScreen>
    <Pressable accessibilityRole="button" accessibilityLabel={t('backToModules')} onFocus={() => setBackFocused(true)} onBlur={() => setBackFocused(false)} onPress={() => { void (async () => { await saveNow(); await stopNarration(); router.replace('/' as Href); })(); }} style={({ pressed }) => [styles.back, backFocused && styles.focused, pressed && styles.pressed]}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="arrow-left" size={24} color={palette.primary} /><Text style={styles.backText}>{t('backToModules')}</Text></Pressable>
    <Header eyebrow={`${state.language === 'es' ? 'Módulo' : 'Module'} ${module.order}`} title={module.shortTitle} subtitle={module.description} />
    <View style={styles.moduleMeta}><Text style={styles.metaText}>{module.screens.length} {state.language === 'es' ? 'pasos' : 'steps'}</Text><Text style={styles.metaDot}>•</Text><Text style={styles.metaText}>~{Math.max(3, Math.ceil(module.screens.length * 1.25))} min</Text><Text style={styles.metaDot}>•</Text><Text style={styles.metaText}>{progress.percentage}% {state.language === 'es' ? 'completado' : 'complete'}</Text></View>
    <Card style={styles.nextCard}><Text style={styles.nextLabel}>{progress.percentage === 100 ? (state.language === 'es' ? 'REPASAR MÓDULO' : 'REVIEW MODULE') : (state.language === 'es' ? 'SIGUIENTE PASO' : 'NEXT UP')}</Text><Text style={styles.nextTitle}>{startScreen.title}</Text><Text style={styles.nextMeta}>{state.language === 'es' ? `Paso ${nextIndex + 1} de ${module.screens.length}` : `Step ${nextIndex + 1} of ${module.screens.length}`}</Text><ActionButton buttonStyle={styles.fullButton} label={action} icon="arrow-right" onPress={() => router.push(`/lesson/${module.id}/${startScreen.id}` as Href)} /></Card>
    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{state.language === 'es' ? 'En este módulo' : 'In this module'}</Text></View>
    <View style={styles.stepList}>{module.screens.map((lesson, index) => {
      const complete = state.completedScreenIds.includes(lesson.id);
      const current = lesson.id === startScreen.id && !complete;
      return <View key={lesson.id} style={[styles.stepRow, complete && styles.stepComplete, current && styles.stepCurrent]}>{!current && !complete ? <GradientSurface /> : null}<View style={[styles.stepMarker, complete && styles.stepMarkerComplete, current && styles.stepMarkerCurrent]}>{complete ? <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check" size={15} color={palette.success} /> : <Text style={[styles.stepNumber, current && styles.stepNumberCurrent]}>{String(index + 1).padStart(2, '0')}</Text>}</View><Text numberOfLines={2} style={[styles.stepTitle, complete && styles.stepTitleComplete]}>{lesson.title}</Text></View>;
    })}</View>
    <View style={styles.noteRow}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="shield-check-outline" size={22} color={palette.accent} /><Text style={styles.note}>{state.language === 'es' ? 'Puede salir, volver atrás y repasar cualquier paso. Las respuestas incorrectas no bloquean el progreso.' : 'You can leave, go back, and revisit any step. Incorrect answers never block progress.'}</Text></View>
  </AppScreen>;
}

const styles = StyleSheet.create({
  back: { minHeight: touchTarget, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  backText: { color: palette.primary, fontFamily: fontFamily.body, fontWeight: '800' },
  focused: { outlineWidth: 2, outlineColor: palette.focus, outlineOffset: 2 },
  pressed: { opacity: 0.72 },
  moduleMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  metaText: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 14 },
  metaDot: { color: palette.border, fontSize: 14 },
  nextCard: { gap: spacing.sm, padding: 18, borderRadius: 22 },
  nextLabel: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  nextTitle: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 21, lineHeight: 28, fontWeight: '800' },
  nextMeta: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 13 },
  fullButton: { alignSelf: 'stretch', marginTop: spacing.sm },
  sectionHeading: { paddingTop: spacing.sm },
  sectionTitle: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 22, lineHeight: 29, fontWeight: '800' },
  stepList: { gap: spacing.sm },
  stepRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: palette.border, borderRadius: 16, backgroundColor: 'transparent', overflow: 'hidden' },
  stepComplete: { backgroundColor: palette.successSoft },
  stepCurrent: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  stepMarker: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.border },
  stepMarkerComplete: { borderColor: palette.success, backgroundColor: palette.successSoft },
  stepMarkerCurrent: { borderColor: palette.primary },
  stepNumber: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 11, fontWeight: '900' },
  stepNumberCurrent: { color: palette.primary },
  stepTitle: { flex: 1, color: palette.body, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20 },
  stepTitleComplete: { color: palette.inkMuted },
  noteRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', backgroundColor: palette.surfaceSoft, padding: spacing.md, borderRadius: 16 },
  note: { flex: 1, color: palette.body, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 23 },
});
