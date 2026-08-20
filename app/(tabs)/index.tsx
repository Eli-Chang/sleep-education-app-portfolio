import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getModules } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { moduleProgress, overallProgress } from '@/src/utils/progress';
import { ActionButton, AppScreen, Card, GradientSurface, Header } from '@/src/components/ui';
import { TabRouteBoundary } from '@/src/components/TabRouteBoundary';
import { fontFamily, palette, radius, spacing } from '@/src/theme/tokens';

const moduleLooks = [
  { color: palette.primary, soft: palette.primarySoft, icon: 'weather-night' as const },
  { color: palette.accent, soft: palette.warningSoft, icon: 'account-heart-outline' as const },
  { color: palette.primary, soft: palette.successSoft, icon: 'target' as const },
  { color: palette.accent, soft: palette.primarySoft, icon: 'mother-heart' as const },
  { color: palette.primary, soft: palette.warningSoft, icon: 'bed-clock' as const },
  { color: palette.primary, soft: palette.primarySoft, icon: 'medical-bag' as const },
  { color: palette.accent, soft: palette.successSoft, icon: 'heart-multiple-outline' as const },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const { state, loaded } = useApp();
  const [focusedModuleId, setFocusedModuleId] = useState<string | null>(null);
  const modules = getModules(state.language);
  const overall = overallProgress(modules, state.completedScreenIds);
  if (!loaded) return <TabRouteBoundary><AppScreen><Header title={t('loading')} /></AppScreen></TabRouteBoundary>;
  const current = modules.find((module) => module.id === state.currentModuleId);

  const pathModule = modules.find((module) => moduleProgress(module, state.completedScreenIds).percentage < 100) ?? (overall.percentage < 100 ? current ?? modules[0] : undefined);
  const pathProgress = pathModule ? moduleProgress(pathModule, state.completedScreenIds) : undefined;
  const pathScreen = pathModule?.screens.find((screen) => !state.completedScreenIds.includes(screen.id)) ?? pathModule?.screens[0];
  return <TabRouteBoundary><AppScreen>
    <View style={styles.hero}><Header eyebrow={t('appName')} title={state.language === 'es' ? 'Empiece por comprender su sueño.' : 'Start by understanding sleep.'} subtitle={t('welcome')} /></View>
    {overall.percentage === 100 ? <Card style={styles.pathCard}>
      <Text style={styles.pathLabel}>{t('allModulesComplete')}</Text>
      <Text style={styles.pathStep}>{t('reviewModules')}</Text>
    </Card> : pathModule && pathProgress && pathScreen ? <Card style={styles.pathCard}>
      <View style={styles.pathHeader}><Text style={styles.pathLabel}>{overall.completed ? (state.language === 'es' ? 'CONTINUAR APRENDIENDO' : 'CONTINUE LEARNING') : (state.language === 'es' ? 'EMPEZAR A APRENDER' : 'START LEARNING')}</Text><Text style={styles.pathPercent}>{overall.percentage}%</Text></View>
      <View style={styles.pathTrack}><View style={[styles.pathFill, { width: `${overall.percentage}%` }]} /></View>
      <Text style={styles.pathStep}>{overall.completed ? `${state.language === 'es' ? 'Paso' : 'Step'} ${pathProgress.completed + 1} · ${pathScreen.title}` : `${state.language === 'es' ? 'Comience con' : 'Start with'} ${pathModule.shortTitle}`}</Text>
      <Text style={styles.pathProgressSummary}>{overall.completed} / {overall.total} {state.language === 'es' ? 'pasos' : 'steps'}</Text>
      <ActionButton buttonStyle={styles.pathAction} label={`${overall.completed ? t('continue') : t('start')} ${state.language === 'es' ? 'módulo' : 'Module'} ${pathModule.order}`} icon="arrow-right" onPress={() => router.push(`/module/${pathModule.id}` as Href)} />
    </Card> : null}
    <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>{state.language === 'es' ? 'Módulos' : 'Modules'}</Text><Text style={styles.sectionHint}>{modules.length} {state.language === 'es' ? 'módulos' : 'modules'}</Text></View>
    <View style={styles.list}>{modules.map((module) => {
      const progress = moduleProgress(module, state.completedScreenIds);
      const look = moduleLooks[module.order - 1];
      const status = progress.percentage === 100 ? t('completed') : progress.percentage > 0 ? t('inProgress') : t('notStarted');
      const action = progress.percentage === 100 ? t('review') : progress.percentage ? t('continue') : t('start');
      return <Pressable key={module.id} accessibilityRole="button" accessibilityLabel={`${module.order}. ${module.title}. ${status}`} onFocus={() => setFocusedModuleId(module.id)} onBlur={() => setFocusedModuleId(null)} onPress={() => router.push(`/module/${module.id}` as Href)} style={({ pressed }) => [styles.moduleCard, focusedModuleId === module.id && styles.focusedRow, pressed && styles.pressedRow]}>
        <GradientSurface />
        <View style={styles.moduleCardHeader}><View style={styles.moduleCopy}><Text style={[styles.moduleKicker, { color: look.color }]}>{state.language === 'es' ? 'MÓDULO' : 'MODULE'} {module.order}</Text><Text style={styles.moduleTitle}>{module.title}</Text></View>{progress.percentage > 0 ? <ProgressRing value={progress.percentage} color={look.color} complete={progress.percentage === 100} /> : null}</View>
        <View style={styles.moduleMeta}><Text style={styles.progressLabel}>{progress.total} {state.language === 'es' ? 'pasos' : 'steps'}</Text><Text style={styles.metaDot}>•</Text><Text style={styles.progressLabel}>~{Math.max(3, Math.ceil(module.screens.length * 1.25))} min</Text></View>
        <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${progress.percentage}%`, backgroundColor: look.color }]} /></View>
        <View style={styles.moduleFooter}><Text style={styles.footerStatus}>{progress.percentage ? `${progress.completed} / ${progress.total} ${state.language === 'es' ? 'pasos' : 'steps'}` : t('notStarted')}</Text><Text style={[styles.actionText, { color: look.color }]}>{action} →</Text></View>
      </Pressable>;
    })}</View>
  </AppScreen></TabRouteBoundary>;
}

function ProgressRing({ value, color, complete }: { value: number; color: string; complete: boolean }) {
  return <View accessibilityElementsHidden style={[styles.progressRing, { borderColor: palette.ink, borderTopColor: color, borderRightColor: value > 50 ? color : palette.ink }]}>{complete ? <MaterialCommunityIcons name="check" size={21} color={color} /> : null}</View>;
}

const styles = StyleSheet.create({
  hero: { paddingTop: spacing.sm },
  pathCard: { gap: spacing.md },
  pathHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  pathLabel: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  pathPercent: { color: palette.primary, fontFamily: fontFamily.heading, fontSize: 18, fontWeight: '900' },
  pathTrack: { height: 9, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: palette.border },
  pathFill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.primary },
  pathStep: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20 },
  pathProgressSummary: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 12, fontWeight: '700' },
  pathAction: { alignSelf: 'stretch' },
  sectionHeading: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: spacing.md, paddingTop: spacing.sm },
  sectionTitle: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 24, lineHeight: 31, fontWeight: '900' },
  sectionHint: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 14, paddingBottom: 3 },
  list: { gap: spacing.sm },
  moduleCard: { gap: spacing.md, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: palette.border, backgroundColor: 'transparent', overflow: 'hidden' },
  moduleCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  moduleCopy: { flex: 1, gap: spacing.xs, minWidth: 0 },
  moduleKicker: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  moduleTitle: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 20, lineHeight: 25, fontWeight: '800' },
  moduleMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metaDot: { color: palette.inkMuted, fontSize: 13 },
  progressLabel: { color: palette.inkMuted, fontSize: 12, fontWeight: '700' },
  miniTrack: { width: '100%', height: 8, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: palette.border },
  miniFill: { height: '100%', borderRadius: radius.pill },
  moduleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  footerStatus: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 12, fontWeight: '700' },
  actionText: { fontFamily: fontFamily.body, fontSize: 14, fontWeight: '800' },
  progressRing: { width: 42, height: 42, borderRadius: 21, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  focusedRow: { outlineWidth: 2, outlineColor: palette.focus, outlineOffset: 3 },
  pressedRow: { opacity: 0.76 },
});
