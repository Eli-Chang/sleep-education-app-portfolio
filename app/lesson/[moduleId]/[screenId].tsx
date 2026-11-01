import { Redirect, router, useLocalSearchParams, usePathname, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Easing, Keyboard, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getModule } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { LessonRenderer } from '@/src/components/LessonRenderer';
import { ActionButton, AppScreen, ProgressMeter } from '@/src/components/ui';
import { chooseVoice, isNarrationSpeaking, replayNarration, speakFeedback, speakScreen, stopNarration } from '@/src/services/narration';
import { palette, radius, spacing, touchTarget, type as typeScale } from '@/src/theme/tokens';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

type NarrationState = 'listen' | 'pause' | 'replay' | 'unavailable';

export default function LessonScreen() {
  const { moduleId, screenId, direction } = useLocalSearchParams<{ moduleId: string; screenId?: string; direction?: 'forward' | 'backward' }>();
  const pathname = usePathname();
  const isStableLessonRoute = pathname === `/lesson/${moduleId}`;
  const { t } = useTranslation();
  const { state, completeScreen, setVoice, saveNow, setPendingVelaActivity } = useApp();
  const module = getModule(state.language, moduleId);
  const requestedScreenId = screenId ?? module?.screens[0]?.id;
  const legacyLessonHref = !isStableLessonRoute && screenId
    ? `/lesson/${moduleId}?screenId=${encodeURIComponent(screenId)}&direction=${direction ?? 'forward'}` as Href
    : undefined;
  const [displayedScreenId, setDisplayedScreenId] = useState(requestedScreenId);
  const displayedScreenIdRef = useRef(requestedScreenId);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const initialEntryRef = useRef(true);
  const transitionAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const transition = React.useRef(new Animated.Value(0)).current;
  const { width: viewportWidth } = useWindowDimensions();
  const lessonWidth = Math.max(viewportWidth, 1);
  // Narrow phones keep Previous as a labelled icon button so Next never truncates.
  const compactControls = viewportWidth < 360;
  const entryOffset = direction === 'backward' ? -lessonWidth : lessonWidth;
  const index = module?.screens.findIndex((candidate) => candidate.id === displayedScreenId) ?? -1;
  const screen = index >= 0 ? module?.screens[index] : undefined;
  const incomingScreen = module?.screens.find((candidate) => candidate.id === requestedScreenId);
  const latestAttempt = state.answerAttempts[displayedScreenId ?? '']?.at(-1);
  const [submittedNow, setSubmittedNow] = useState(Boolean(latestAttempt));
  const [submissionCorrect, setSubmissionCorrect] = useState(latestAttempt?.correct === true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [narrationState, setNarrationState] = useState<NarrationState>('listen');
  const navigationLocked = useRef(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!requestedScreenId) return;
    transitionAnimation.current?.stop();
    if (requestedScreenId === displayedScreenIdRef.current) {
      // A re-run while the entry animation is in flight (saved language loading,
      // reduced motion being detected) stopped it above; settle the lesson in place
      // instead of leaving it translated off-screen.
      if (!initialEntryRef.current) { transition.setValue(1); return; }
      initialEntryRef.current = false;
      transition.setValue(reducedMotion ? 1 : 0);
      if (!reducedMotion) {
        const animation = Animated.timing(transition, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
        transitionAnimation.current = animation;
        animation.start(() => { transitionAnimation.current = null; });
      }
      return;
    }

    initialEntryRef.current = false;
    if (reducedMotion) {
      displayedScreenIdRef.current = requestedScreenId;
      setDisplayedScreenId(requestedScreenId);
      setIsTransitioning(false);
      transition.setValue(1);
      return;
    }

    if (!incomingScreen) return;
    setIsTransitioning(true);
    transition.setValue(0);
    const animation = Animated.timing(transition, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    transitionAnimation.current = animation;
    animation.start(({ finished }) => {
      if (!finished) return;
      displayedScreenIdRef.current = requestedScreenId;
      setDisplayedScreenId(requestedScreenId);
      setIsTransitioning(false);
      transitionAnimation.current = null;
      transition.setValue(1);
    });
    return () => animation.stop();
  }, [direction, incomingScreen, lessonWidth, reducedMotion, requestedScreenId, transition]);
  // Read the saved voice through a ref: saving the voice on the first Listen must not re-run the reset
  // below, which would flip the control back to "Listen" while narration is still playing.
  const savedVoicesRef = useRef(state.voiceByLocale);
  savedVoicesRef.current = state.voiceByLocale;
  useEffect(() => {
    let active = true;
    setNarrationState(state.narrationEnabled ? 'listen' : 'unavailable');
    if (state.narrationEnabled) void chooseVoice(state.language, savedVoicesRef.current[state.language]).then((voice) => { if (active) setNarrationState((current) => voice ? current : 'unavailable'); });
    return () => { active = false; };
  }, [displayedScreenId, state.language, state.narrationEnabled]);
  useEffect(() => {
    const attempt = state.answerAttempts[displayedScreenId ?? '']?.at(-1);
    setSubmittedNow(Boolean(attempt));
    setSubmissionCorrect(attempt?.correct === true);
  }, [displayedScreenId, state.answerAttempts]);
  useEffect(() => {
    if (narrationState !== 'pause') return;
    let active = true;
    let poll: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => { poll = setInterval(() => { void isNarrationSpeaking().then((speaking) => { if (active && !speaking) setNarrationState('replay'); }); }, 500); }, 500);
    return () => { active = false; clearTimeout(start); if (poll) clearInterval(poll); };
  }, [narrationState]);
  useEffect(() => () => { void stopNarration(); }, [displayedScreenId, state.language]);
  const backToModules = () => {
    if (router.canDismiss()) router.dismissTo('/' as Href);
    else router.replace('/' as Href);
  };
  const leaveLesson = () => {
    void (async () => {
      await saveNow();
      await stopNarration();
      if (router.canDismiss()) router.dismissTo(`/module/${moduleId}` as Href);
      else router.replace(`/module/${moduleId}` as Href);
    })();
  };
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardVisible) { Keyboard.dismiss(); setKeyboardVisible(false); return true; }
      leaveLesson();
      return true;
    });
    return () => { show.remove(); hide.remove(); back.remove(); };
  }, [keyboardVisible, moduleId, saveNow]);
  if (legacyLessonHref) return <Redirect href={legacyLessonHref} />;
  if (!module || !screen || index < 0) return <AppScreen><Text style={styles.title}>{state.language === 'es' ? 'Lección no encontrada' : 'Lesson not found'}</Text><ActionButton label={t('backToModules')} icon="arrow-left" onPress={backToModules} /></AppScreen>;
  const previous = module.screens[index - 1];
  const next = module.screens[index + 1];
  const isReflection = screen.type === 'reflection' || ('questionKind' in screen && screen.questionKind === 'reflection');
  const isScoredQuestion = (screen.type === 'singleChoice' && Boolean(screen.correctChoiceId)) || (screen.type === 'multiSelect' && Boolean(screen.correctChoiceIds?.length));
  const canContinue = !isScoredQuestion || submissionCorrect === true;
  const navigate = (targetId: string, move: 'forward' | 'backward') => {
    if (navigationLocked.current) return;
    navigationLocked.current = true;
    void stopNarration();
    if (isStableLessonRoute) router.setParams({ screenId: targetId, direction: move });
    else router.replace(`/lesson/${module.id}?screenId=${encodeURIComponent(targetId)}&direction=${move}` as Href);
    setTimeout(() => { navigationLocked.current = false; }, 320);
  };
  const continueNext = () => {
    if (isScoredQuestion && submissionCorrect !== true) return;
    completeScreen(screen.id, module.id, next?.id, !next);
    void stopNarration();
    if (next) navigate(next.id, 'forward'); else router.replace(`/module/${module.id}/complete` as Href);
  };
  const play = async () => {
    if (narrationState === 'pause') { await stopNarration(); setNarrationState('replay'); return; }
    if (narrationState === 'replay') { if ((await replayNarration()).status === 'speaking') setNarrationState('pause'); return; }
    const outcome = await speakScreen(screen, state.language, state.narrationRate, state.voiceByLocale[state.language], state.narrationPitch);
    if (outcome.status === 'speaking') { if (state.voiceByLocale[state.language] !== outcome.voice) setVoice(state.language, outcome.voice); setNarrationState('pause'); }
    else if (outcome.status === 'unavailable') Alert.alert(
      state.language === 'es' ? 'Voz no disponible' : 'Narration voice unavailable',
      state.language === 'es' ? 'Revise los ajustes de idioma o voz del dispositivo. Puede continuar leyendo la lección.' : 'Check the device language or speech settings. You can continue reading the lesson.',
    );
  };
  const narrationLabel = narrationState === 'pause' ? t('stop') : narrationState === 'replay' ? t('replay') : state.language === 'es' ? 'Escuchar' : 'Listen';
  // When narration is on but this device has no voice for the lesson language, say so to screen readers.
  const narrationAccessibilityLabel = state.narrationEnabled && narrationState === 'unavailable'
    ? (state.language === 'es' ? 'Escuchar: no hay una voz en español disponible en este dispositivo' : 'Listen: no English voice is available on this device')
    : narrationLabel;
  const narrationIcon = narrationState === 'pause' ? 'pause' : narrationState === 'replay' ? 'replay' : narrationState === 'unavailable' ? 'volume-off' : 'volume-high';
  const nextLabel = isReflection && !submittedNow ? t('skipOptional') : next ? t('next') : t('completeModule');
  const renderLessonContent = (lesson: NonNullable<typeof screen>) => {
    const lessonIsReflection = lesson.type === 'reflection' || ('questionKind' in lesson && lesson.questionKind === 'reflection');
    const lessonIsScored = (lesson.type === 'singleChoice' && Boolean(lesson.correctChoiceId)) || (lesson.type === 'multiSelect' && Boolean(lesson.correctChoiceIds?.length));
    const lessonIndex = module.screens.findIndex((candidate) => candidate.id === lesson.id);
    const lessonNext = module.screens[lessonIndex + 1];
    return <LessonRenderer screen={lesson} onOpenVelaActivity={(activity, text) => {
      setPendingVelaActivity({ activityId: activity.id, text });
      router.push({ pathname: '/ai', params: { activityId: activity.id, kind: activity.activityKind, returnTo: `/lesson/${module.id}?screenId=${encodeURIComponent(screen.id)}` } } as Href);
    }} onEditingChange={(editing) => {
      if (editing && lesson.id === screen.id) {
        setSubmittedNow(false);
        setSubmissionCorrect(false);
      }
    }} onSubmitted={(correct) => {
      if (lesson.id !== screen.id) return;
      setSubmittedNow(true);
      setSubmissionCorrect(correct === true);
      if (!lessonIsScored || correct === true) completeScreen(lesson.id, module.id, lessonNext?.id, !lessonNext);
      if (state.narrationEnabled && 'feedback' in lesson && lesson.feedback && lesson.questionKind !== 'reflection') void speakFeedback(lesson.feedback, state.language, state.narrationRate, state.voiceByLocale[state.language], state.narrationPitch);
    }} />;
  };
  const surfaceStyle = (lesson: NonNullable<typeof screen>) => ((lesson.type === 'singleChoice' || lesson.type === 'multiSelect' || lesson.type === 'scenario') && !('questionKind' in lesson && lesson.questionKind === 'reflection')) ? styles.lessonSurface : styles.lessonSurfaceTransparent;
  const renderSurface = (lesson: NonNullable<typeof screen>, style: object, transform: Animated.AnimatedInterpolation<number>, pointerEvents: 'auto' | 'none' = 'auto') => <Animated.View style={[style, { pointerEvents, transform: [{ translateX: transform }] }]}>{renderLessonContent(lesson)}</Animated.View>;
  const outgoingOffset = direction === 'backward' ? lessonWidth : -lessonWidth;
  const incomingOffset = direction === 'backward' ? -lessonWidth : lessonWidth;
  const activeTransform = transition.interpolate({ inputRange: [0, 1], outputRange: [entryOffset, 0] });
  const outgoingTransform = transition.interpolate({ inputRange: [0, 1], outputRange: [0, outgoingOffset] });
  const incomingTransform = transition.interpolate({ inputRange: [0, 1], outputRange: [incomingOffset, 0] });
  const stepLabel = `${state.language === 'es' ? 'Paso' : 'Step'} ${index + 1} ${state.language === 'es' ? 'de' : 'of'} ${module.screens.length}`;
  const footer = <View style={styles.controls}>
    {previous ? <ActionButton wrapperStyle={compactControls ? undefined : styles.controlSlot} buttonStyle={styles.footerButton} compact={compactControls} variant="secondary" accessibilityLabel={t('previous')} label={t('previous')} labelNumberOfLines={2} icon="arrow-left" onPress={() => navigate(previous.id, 'backward')} /> : null}
    <ActionButton wrapperStyle={styles.controlNext} buttonStyle={styles.footerButton} label={nextLabel} icon={isReflection && !submittedNow ? 'arrow-right' : next ? 'arrow-right' : 'check'} iconPosition="trailing" labelNumberOfLines={2} disabled={!canContinue} onPress={continueNext} />
  </View>;
  return <AppScreen width="reading" scrollKey={requestedScreenId ?? displayedScreenId} contentStyle={styles.lessonContent} footer={footer}>
    <View style={styles.topRow}>
      <ActionButton wrapperStyle={styles.backWrapper} buttonStyle={styles.back} variant="ghost" accessibilityLabel={`${t('backToModule')}: ${module.shortTitle}`} label={module.shortTitle} labelNumberOfLines={2} icon="arrow-left" textStyle={styles.backModule} onPress={leaveLesson} />
      <ActionButton buttonStyle={styles.listen} variant="quiet" label={narrationLabel} accessibilityLabel={narrationAccessibilityLabel} icon={narrationIcon} textStyle={styles.listenText} disabled={!state.narrationEnabled || narrationState === 'unavailable'} onPress={() => void play()} />
    </View>
    <View style={styles.progressBlock}>
      <View style={styles.progressLabels}><Text style={styles.moduleLabel}>{state.language === 'es' ? 'Módulo' : 'Module'} {module.order}</Text><Text style={styles.step}>{stepLabel}</Text></View>
      <ProgressMeter compact steps={{ total: module.screens.length, current: index + 1 }} value={Math.round(((index + 1) / module.screens.length) * 100)} label={stepLabel} />
    </View>
    <View testID="lesson-surface" style={styles.lessonSurfaceViewport}>
      {isTransitioning && incomingScreen ? <>
        {renderSurface(screen, [surfaceStyle(screen), styles.outgoingSurface], outgoingTransform, 'none')}
        {renderSurface(incomingScreen, surfaceStyle(incomingScreen), incomingTransform, 'none')}
      </> : renderSurface(screen, surfaceStyle(screen), activeTransform)}
    </View>
  </AppScreen>;
}
const styles = StyleSheet.create({
  lessonContent: { gap: 14, paddingTop: Platform.OS === 'web' ? 18 : 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  backWrapper: { flexShrink: 1, minWidth: 0 },
  back: { paddingLeft: 6, paddingRight: 14, minHeight: touchTarget, justifyContent: 'flex-start' },
  backModule: { fontSize: 16, textAlign: 'left' },
  listen: { minHeight: touchTarget - 2, paddingHorizontal: 14, gap: 6 },
  listenText: { fontSize: 15 },
  progressBlock: { gap: 8 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  moduleLabel: { ...typeScale.eyebrow, color: palette.dawnInk },
  step: { ...typeScale.meta, color: palette.inkMuted },
  title: { ...typeScale.title, color: palette.ink },
  controls: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  controlSlot: { flex: 1, minWidth: 0 },
  footerButton: { paddingHorizontal: 14, gap: 8 },
  controlNext: { flex: 1.3, minWidth: 0 },
  lessonSurfaceViewport: { position: 'relative', overflow: 'hidden', marginHorizontal: -4, paddingHorizontal: 4, paddingBottom: 8 },
  outgoingSurface: { position: 'absolute', top: 0, right: 4, bottom: 0, left: 4 },
  lessonSurface: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: radius.xl, paddingHorizontal: 18, paddingVertical: 22, overflow: 'hidden' },
  lessonSurfaceTransparent: { backgroundColor: 'transparent' },
});
