import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getModule } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { stopNarration } from '@/src/services/narration';
import { moduleProgress } from '@/src/utils/progress';
import { ActionButton, AppScreen, Card, Header, NightPillButton, ProgressMeter, SectionHeading, elevation } from '@/src/components/ui';
import { NightSky } from '@/src/components/NightSky';
import { fontFamily, palette, radius, spacing, type as typeScale } from '@/src/theme/tokens';
import type { LessonScreen } from '@/src/types/content';

type StepKind = 'lesson' | 'question' | 'reflection' | 'recap';
// Mirrors LessonRenderer: unscored source questions are presented as personal reflections.
const stepKind = (screen: LessonScreen): StepKind => screen.type === 'content' ? 'lesson' : screen.type === 'summary' ? 'recap'
  : screen.type === 'reflection' || ('questionKind' in screen && screen.questionKind === 'reflection')
    || ('answerBehaviorProvenance' in screen && screen.answerBehaviorProvenance === 'CIAS_ANSWER_KEY_NOT_RECOVERED') ? 'reflection' : 'question';
const stepIcons = { lesson: 'book-open-page-variant-outline', question: 'help-circle-outline', reflection: 'heart-outline', recap: 'flag-checkered' } as const;
const stepLabels = {
  en: { lesson: 'Lesson', question: 'Question', reflection: 'Reflection', recap: 'Recap' },
  es: { lesson: 'Lección', question: 'Pregunta', reflection: 'Reflexión', recap: 'Resumen' },
} as const;

export default function ModuleOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { state, saveNow } = useApp();
  const es = state.language === 'es';
  const leaveModule = () => {
    void (async () => {
      await saveNow();
      await stopNarration();
      if (router.canDismiss()) router.dismissTo('/' as Href);
      else router.replace('/' as Href);
    })();
  };
  const module = getModule(state.language, id);
  if (!module) return <AppScreen><Header title={es ? 'Módulo no encontrado' : 'Module not found'} /><ActionButton label={t('backToModules')} icon="arrow-left" onPress={leaveModule} /></AppScreen>;

  const progress = moduleProgress(module, state.completedScreenIds);
  const startScreen = module.screens.find((screen) => !state.completedScreenIds.includes(screen.id)) ?? module.screens[0];
  const action = progress.percentage === 100 ? (es ? 'Repasar módulo' : 'Review Module') : progress.percentage > 0 ? t('continue') : t('start');
  const nextIndex = Math.max(0, module.screens.findIndex((screen) => screen.id === startScreen.id));
  const minutes = Math.max(3, Math.ceil(module.screens.length * 1.25));

  const hero = <View style={[styles.hero, { paddingTop: insets.top + 12 }]}>
    <NightSky moon={false} />
    <View style={styles.heroInner}>
      <NightPillButton label={t('backToModules')} icon="arrow-left" onPress={leaveModule} />
      <Header tone="night" eyebrow={`${es ? 'Módulo' : 'Module'} ${module.order}`} title={module.title} subtitle={module.description} />
      <View style={styles.metaRow}>
        <MetaChip icon="format-list-numbered" label={`${module.screens.length} ${es ? 'pasos' : 'steps'}`} />
        <MetaChip icon="clock-outline" label={`~${minutes} min`} />
        <MetaChip icon={progress.percentage === 100 ? 'check-circle-outline' : 'chart-donut'} label={`${progress.percentage}% ${es ? 'completado' : 'complete'}`} />
      </View>
    </View>
  </View>;

  return <AppScreen hero={hero} contentStyle={styles.content}>
    <Card style={[styles.nextCard, elevation('raised')]}>
      <Text style={styles.nextLabel}>{progress.percentage === 100 ? (es ? 'REPASAR MÓDULO' : 'REVIEW MODULE') : (es ? 'SIGUIENTE PASO' : 'NEXT UP')}</Text>
      <Text style={styles.nextTitle}>{startScreen.title}</Text>
      <Text style={styles.nextMeta}>{es ? `Paso ${nextIndex + 1} de ${module.screens.length}` : `Step ${nextIndex + 1} of ${module.screens.length}`}</Text>
      <ProgressMeter compact value={progress.percentage} label={es ? 'Progreso del módulo' : 'Module progress'} />
      <ActionButton buttonStyle={styles.fullButton} label={action} icon="arrow-right" iconPosition="trailing" onPress={() => router.push(`/lesson/${module.id}?screenId=${encodeURIComponent(startScreen.id)}&direction=forward` as Href)} />
    </Card>
    <SectionHeading title={es ? 'En este módulo' : 'In this module'} />
    <View style={styles.stepList}>{module.screens.map((lesson, index) => {
      const complete = state.completedScreenIds.includes(lesson.id);
      const current = lesson.id === startScreen.id && !complete;
      const kind = stepKind(lesson);
      return <View key={lesson.id} style={styles.stepRow}>
        <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden style={styles.stepRail}>
          <View style={[styles.stepLine, index === 0 && styles.stepLineFirst, index === module.screens.length - 1 && styles.stepLineLast]} />
          <View style={[styles.stepMarker, complete && styles.stepMarkerComplete, current && styles.stepMarkerCurrent]}>{complete ? <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check" size={15} color={palette.white} /> : <Text style={[styles.stepNumber, current && styles.stepNumberCurrent]}>{index + 1}</Text>}</View>
        </View>
        <View style={[styles.stepBody, current && styles.stepBodyCurrent]}>
          <Text numberOfLines={2} style={[styles.stepTitle, complete && styles.stepTitleComplete]}>{lesson.title}</Text>
          <View style={styles.stepMeta}>
            <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={stepIcons[kind]} size={14} color={palette.inkMuted} />
            <Text style={styles.stepKind}>{stepLabels[state.language][kind]}</Text>
            {complete ? <Text style={styles.stepDone}>· {t('completed')}</Text> : current ? <Text style={styles.stepNext}>· {es ? 'Siguiente' : 'Up next'}</Text> : null}
          </View>
        </View>
      </View>;
    })}</View>
    <View style={styles.noteRow}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="shield-check-outline" size={22} color={palette.primary} /><Text style={styles.note}>{es ? 'Puede salir, volver atrás y repasar cualquier paso. Las respuestas incorrectas no bloquean el progreso.' : 'You can leave, go back, and revisit any step. Incorrect answers never block progress.'}</Text></View>
  </AppScreen>;
}

function MetaChip({ icon, label }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }) {
  return <View style={styles.chip}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={icon} size={15} color={palette.moon} /><Text style={styles.chipText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  hero: { overflow: 'hidden', backgroundColor: palette.night, paddingBottom: 76 },
  heroInner: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 20, gap: 18, alignItems: 'flex-start' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(246,242,234,0.12)' },
  chipText: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 13.5, color: palette.onNight },
  content: { paddingTop: 0 },
  nextCard: { marginTop: -56, gap: 10, padding: 22, borderRadius: radius.xl },
  nextLabel: { ...typeScale.eyebrow, color: palette.dawnInk },
  nextTitle: { ...typeScale.section, color: palette.ink },
  nextMeta: { ...typeScale.meta, color: palette.inkMuted, marginBottom: 4 },
  fullButton: { alignSelf: 'stretch', marginTop: spacing.sm },
  stepList: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'stretch' },
  stepRail: { width: 30, alignItems: 'center' },
  stepLine: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: palette.border },
  stepLineFirst: { top: 18 },
  stepLineLast: { bottom: undefined, height: 18 },
  stepMarker: { marginTop: 4, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: palette.borderStrong, backgroundColor: palette.surface },
  stepMarkerComplete: { borderColor: palette.success, backgroundColor: palette.success },
  stepMarkerCurrent: { borderColor: palette.night, backgroundColor: palette.night },
  stepNumber: { color: palette.body, fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 12.5 },
  stepNumberCurrent: { color: palette.onNight },
  stepBody: { flex: 1, minWidth: 0, gap: 3, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 6, borderRadius: radius.md },
  stepBodyCurrent: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  stepTitle: { color: palette.ink, fontFamily: fontFamily.body, fontWeight: 'normal', fontSize: 16, lineHeight: 22 },
  stepTitleComplete: { color: palette.body },
  stepMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stepKind: { ...typeScale.meta, fontSize: 13, color: palette.inkMuted },
  stepDone: { ...typeScale.meta, fontSize: 13, color: palette.success },
  stepNext: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 13, color: palette.dawnInk },
  noteRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', backgroundColor: palette.primarySoft, padding: spacing.md, borderRadius: radius.md },
  note: { flex: 1, color: palette.body, fontFamily: fontFamily.body, fontSize: 15.5, lineHeight: 23 },
});
