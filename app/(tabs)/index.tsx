import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getModules } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { stopNarration } from '@/src/services/narration';
import { moduleProgress, overallProgress } from '@/src/utils/progress';
import { ActionButton, AppScreen, Card, Header, NightPillButton, ProgressMeter, SectionHeading, StatusPill, elevation } from '@/src/components/ui';
import { NightSky } from '@/src/components/NightSky';
import { TabRouteBoundary } from '@/src/components/TabRouteBoundary';
import { fontFamily, palette, radius, spacing, touchTarget, type as typeScale } from '@/src/theme/tokens';

// Decorative module glyphs; they carry no meaning beyond visual wayfinding.
// Keyed by module ID so inserting a module never shifts the icons of the modules after it.
const moduleIcons: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  m1: 'weather-night', m2: 'account-heart-outline', m3: 'target', m4: 'mother-heart', m5: 'bed-clock',
  m5b: 'home-lightbulb-outline', m6: 'stethoscope', m7: 'heart-multiple-outline', m8: 'air-filter', m9: 'tools',
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, loaded, setLanguage } = useApp();
  const [focusedModuleId, setFocusedModuleId] = useState<string | null>(null);
  const modules = getModules(state.language);
  const overall = overallProgress(modules, state.completedScreenIds);
  const es = state.language === 'es';
  if (!loaded) return <TabRouteBoundary><AppScreen><Header title={t('loading')} /></AppScreen></TabRouteBoundary>;
  const current = modules.find((module) => module.id === state.currentModuleId);

  const pathModule = modules.find((module) => moduleProgress(module, state.completedScreenIds).percentage < 100) ?? (overall.percentage < 100 ? current ?? modules[0] : undefined);
  const pathProgress = pathModule ? moduleProgress(pathModule, state.completedScreenIds) : undefined;
  const pathScreen = pathModule?.screens.find((screen) => !state.completedScreenIds.includes(screen.id)) ?? pathModule?.screens[0];
  const switchLanguage = () => { void stopNarration(); setLanguage(es ? 'en' : 'es'); };

  const hero = <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
    <NightSky moon={false} />
    <View style={styles.heroInner}>
      <View style={styles.heroTop}>
        <View style={styles.brand}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="weather-night" size={18} color={palette.moon} /><Text style={styles.brandText}>{t('appName')}</Text></View>
        <NightPillButton label={es ? 'English' : 'Español'} icon="translate" accessibilityLabel={es ? 'Switch to English' : 'Cambiar a español'} accessibilityLanguage={es ? 'en' : 'es'} onPress={switchLanguage} />
      </View>
      <Header tone="night" title={es ? 'Empiece por comprender su sueño.' : 'Start by understanding sleep.'} subtitle={t('welcome')} />
    </View>
  </View>;

  return <TabRouteBoundary><AppScreen hero={hero} contentStyle={styles.content}>
    {overall.percentage === 100 ? <Card style={[styles.pathCard, elevation('raised')]}>
      <View style={styles.completeBadge}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check" size={26} color={palette.white} /></View>
      <Text accessibilityRole="header" style={styles.pathTitle}>{t('allModulesComplete')}</Text>
      <Text style={styles.pathStep}>{t('reviewModules')}</Text>
    </Card> : pathModule && pathProgress && pathScreen ? <Card style={[styles.pathCard, elevation('raised')]}>
      <View style={styles.pathHeader}>
        <Text style={styles.pathLabel}>{overall.completed ? (es ? 'CONTINUAR APRENDIENDO' : 'CONTINUE LEARNING') : (es ? 'EMPEZAR A APRENDER' : 'START LEARNING')}</Text>
        <Text style={styles.pathModuleNumber}>{es ? 'Módulo' : 'Module'} {pathModule.order}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.pathTitle}>{pathModule.title}</Text>
      <Text style={styles.pathStep}>{overall.completed ? `${es ? 'Paso' : 'Step'} ${pathProgress.completed + 1} · ${pathScreen.title}` : `${es ? 'Comience con' : 'Start with'} ${pathModule.shortTitle}`}</Text>
      <View style={styles.pathMeterRow}><Text style={styles.pathProgressSummary}>{overall.completed} / {overall.total} {es ? 'pasos' : 'steps'}</Text><Text style={styles.pathPercent}>{overall.percentage}%</Text></View>
      <ProgressMeter compact value={overall.percentage} label={es ? 'Progreso total' : 'Overall progress'} />
      <ActionButton buttonStyle={styles.pathAction} label={`${overall.completed ? t('continue') : t('start')} ${es ? 'módulo' : 'Module'} ${pathModule.order}`} icon="arrow-right" iconPosition="trailing" onPress={() => router.push(`/module/${pathModule.id}` as Href)} />
    </Card> : null}

    <SectionHeading title={es ? 'Su ruta de aprendizaje' : 'Your learning path'} hint={`${modules.length} ${es ? 'módulos' : 'modules'}`} />
    <View style={styles.list}>{modules.map((module, index) => {
      const progress = moduleProgress(module, state.completedScreenIds);
      const complete = progress.percentage === 100;
      const started = progress.percentage > 0;
      const isNext = module.id === pathModule?.id && !complete;
      const status = complete ? t('completed') : started ? t('inProgress') : t('notStarted');
      const action = complete ? t('review') : started ? t('continue') : t('start');
      return <View key={module.id} style={styles.pathRow}>
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={styles.rail}>
          <View style={[styles.railLine, index === 0 && styles.railLineFirst, index === modules.length - 1 && styles.railLineLast, complete && styles.railLineDone]} />
          <View style={[styles.node, complete && styles.nodeComplete, isNext && styles.nodeNext, started && !complete && !isNext && styles.nodeStarted]}>
            {complete ? <MaterialCommunityIcons name="check" size={18} color={palette.white} /> : <Text style={[styles.nodeText, isNext && styles.nodeTextNext]}>{module.order}</Text>}
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`${module.order}. ${module.title}. ${status}`} onFocus={() => setFocusedModuleId(module.id)} onBlur={() => setFocusedModuleId(null)} onPress={() => router.push(`/module/${module.id}` as Href)} style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [styles.moduleCard, isNext && styles.moduleCardNext, hovered && styles.moduleCardHover, focusedModuleId === module.id && styles.focusedRow, pressed && styles.pressedRow]}>
          <View style={styles.moduleCardHeader}>
            <View style={styles.moduleCopy}>
              <Text style={styles.moduleKicker}>{es ? 'MÓDULO' : 'MODULE'} {module.order}</Text>
              <Text style={styles.moduleTitle}>{module.title}</Text>
            </View>
            <View accessible={false} style={[styles.moduleIcon, complete && styles.moduleIconDone]}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={moduleIcons[module.id] ?? 'book-open-variant'} size={22} color={complete ? palette.success : palette.primary} /></View>
          </View>
          <View style={styles.moduleMeta}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="format-list-numbered" size={15} color={palette.inkMuted} /><Text style={styles.progressLabel}>{progress.total} {es ? 'pasos' : 'steps'}</Text><Text style={styles.metaDot}>·</Text><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="clock-outline" size={15} color={palette.inkMuted} /><Text style={styles.progressLabel}>~{Math.max(3, Math.ceil(module.screens.length * 1.25))} min</Text></View>
          {started && !complete ? <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${progress.percentage}%` }]} /></View> : null}
          <View style={styles.moduleFooter}>
            <StatusPill label={started && !complete ? `${status} · ${progress.completed}/${progress.total}` : status} tone={complete ? 'complete' : started ? 'progress' : 'neutral'} />
            <View style={styles.actionRow}><Text style={styles.actionText}>{action}</Text><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="chevron-right" size={20} color={palette.primary} /></View>
          </View>
        </Pressable>
      </View>;
    })}</View>
  </AppScreen></TabRouteBoundary>;
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', backgroundColor: palette.night, paddingBottom: 84 },
  heroInner: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, gap: 22 },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1, minWidth: 0 },
  brandText: { ...typeScale.eyebrow, color: palette.moon, flexShrink: 1 },
  content: { paddingTop: 0 },
  pathCard: { marginTop: -60, gap: 12, padding: 22, borderRadius: radius.xl },
  pathHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.md },
  pathLabel: { ...typeScale.eyebrow, color: palette.dawnInk },
  pathModuleNumber: { ...typeScale.meta, color: palette.inkMuted },
  pathTitle: { ...typeScale.section, fontSize: 23, lineHeight: 29, color: palette.ink },
  pathStep: { ...typeScale.bodySmall, color: palette.body },
  pathMeterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 },
  pathPercent: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', color: palette.primary, fontSize: 15 },
  pathProgressSummary: { ...typeScale.meta, color: palette.inkMuted },
  pathAction: { alignSelf: 'stretch', marginTop: 6 },
  completeBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.success },
  list: { gap: 0 },
  pathRow: { flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  rail: { width: 34, alignItems: 'center' },
  railLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: palette.border },
  railLineFirst: { top: 26 },
  railLineLast: { bottom: undefined, height: 26 },
  railLineDone: { backgroundColor: 'rgba(43,110,76,0.45)' },
  node: { marginTop: 10, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1.5, borderColor: palette.borderStrong },
  nodeComplete: { backgroundColor: palette.success, borderColor: palette.success },
  nodeNext: { backgroundColor: palette.night, borderColor: palette.night, outlineWidth: 4, outlineStyle: 'solid', outlineColor: 'rgba(229,157,110,0.45)', outlineOffset: 0 } as object,
  nodeStarted: { borderColor: palette.dawnInk, borderWidth: 2 },
  nodeText: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 14, color: palette.body },
  nodeTextNext: { color: palette.onNight },
  moduleCard: { flex: 1, minWidth: 0, marginBottom: 12, gap: 10, padding: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface, ...elevation('subtle') },
  moduleCardNext: { borderColor: palette.primary, borderWidth: 1.5 },
  moduleCardHover: { borderColor: palette.primary },
  moduleCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  moduleCopy: { flex: 1, gap: 4, minWidth: 0 },
  moduleKicker: { ...typeScale.eyebrow, fontSize: 11.5, color: palette.dawnInk },
  moduleTitle: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 20, lineHeight: 25, fontWeight: 'normal' },
  moduleIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.primarySoft },
  moduleIconDone: { backgroundColor: palette.successSoft },
  moduleMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaDot: { color: palette.inkMuted, fontSize: 14, marginHorizontal: 3 },
  progressLabel: { ...typeScale.meta, color: palette.inkMuted },
  miniTrack: { width: '100%', height: 6, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: palette.sunken },
  miniFill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.dawnInk },
  moduleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, flexWrap: 'wrap', marginTop: 2 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 28 },
  actionText: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 15, color: palette.primary },
  focusedRow: { outlineWidth: 3, outlineStyle: 'solid', outlineColor: palette.focus, outlineOffset: 2 } as object,
  pressedRow: { opacity: 0.85 },
  touch: { minHeight: touchTarget },
});
