import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, BackHandler, Easing, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getModule } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { LessonRenderer } from '@/src/components/LessonRenderer';
import { ActionButton, AppScreen, GradientSurface, ProgressMeter } from '@/src/components/ui';
import { chooseVoice, isNarrationSpeaking, replayNarration, speakFeedback, speakScreen, stopNarration } from '@/src/services/narration';
import { fontFamily, palette, radius, spacing, touchTarget } from '@/src/theme/tokens';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

type NarrationState = 'listen' | 'pause' | 'replay' | 'unavailable';

export default function LessonScreen() {
  const { moduleId, screenId, direction } = useLocalSearchParams<{ moduleId: string; screenId: string; direction?: 'forward' | 'backward' }>();
  const { t } = useTranslation();
  const { state, completeScreen, setVoice, saveNow, setPendingVelaActivity } = useApp();
  const module = getModule(state.language, moduleId);
  const index = module?.screens.findIndex((screen) => screen.id === screenId) ?? -1;
  const screen = index >= 0 ? module?.screens[index] : undefined;
  const latestAttempt = state.answerAttempts[screenId]?.at(-1);
  const [submittedNow, setSubmittedNow] = useState(Boolean(latestAttempt));
  const [submissionCorrect, setSubmissionCorrect] = useState(latestAttempt?.correct === true);
  const [homeFocused, setHomeFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [narrationState, setNarrationState] = useState<NarrationState>('listen');
  const navigationLocked = useRef(false);
  const reducedMotion = useReducedMotion();
  const transition = React.useRef(new Animated.Value(0)).current;
  const entryOffset = direction === 'backward' ? -12 : 12;
  useEffect(() => { transition.setValue(reducedMotion ? 1 : 0); if (!reducedMotion) Animated.timing(transition, { toValue: 1, duration: 260, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }).start(); }, [screenId, reducedMotion, transition]);
  useEffect(() => {
    let active = true;
    setNarrationState(state.narrationEnabled ? 'listen' : 'unavailable');
    if (state.narrationEnabled) void chooseVoice(state.language, state.voiceByLocale[state.language]).then((voice) => { if (active) setNarrationState(voice ? 'listen' : 'unavailable'); });
    return () => { active = false; };
  }, [screenId, state.language, state.narrationEnabled, state.voiceByLocale]);
  useEffect(() => {
    const attempt = state.answerAttempts[screenId]?.at(-1);
    setSubmittedNow(Boolean(attempt));
    setSubmissionCorrect(attempt?.correct === true);
  }, [screenId, state.answerAttempts]);
  useEffect(() => {
    if (narrationState !== 'pause') return;
    let active = true;
    let poll: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => { poll = setInterval(() => { void isNarrationSpeaking().then((speaking) => { if (active && !speaking) setNarrationState('replay'); }); }, 500); }, 500);
    return () => { active = false; clearTimeout(start); if (poll) clearInterval(poll); };
  }, [narrationState]);
  useEffect(() => () => { void stopNarration(); }, [screenId, state.language]);
  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardVisible) { Keyboard.dismiss(); setKeyboardVisible(false); return true; }
      router.replace(`/module/${moduleId}` as Href);
      return true;
    });
    return () => { show.remove(); hide.remove(); back.remove(); };
  }, [keyboardVisible, moduleId]);
  if (!module || !screen || index < 0) return <AppScreen><Text style={styles.title}>{state.language === 'es' ? 'Lección no encontrada' : 'Lesson not found'}</Text><ActionButton label={t('backToModules')} icon="arrow-left" onPress={() => router.replace('/' as Href)} /></AppScreen>;
  const previous = module.screens[index - 1];
  const next = module.screens[index + 1];
  const isReflection = screen.type === 'reflection' || ('questionKind' in screen && screen.questionKind === 'reflection');
  const isObjectiveQuestion = (screen.type === 'singleChoice' || screen.type === 'multiSelect' || screen.type === 'scenario') && !isReflection;
  const isScoredQuestion = (screen.type === 'singleChoice' && Boolean(screen.correctChoiceId)) || (screen.type === 'multiSelect' && Boolean(screen.correctChoiceIds?.length));
  const canContinue = !isScoredQuestion || submissionCorrect === true;
  const navigate = (targetId: string, move: 'forward' | 'backward') => { if (navigationLocked.current) return; navigationLocked.current = true; void stopNarration(); router.replace({ pathname: `/lesson/${module.id}/${targetId}`, params: { direction: move } } as Href); setTimeout(() => { navigationLocked.current = false; }, 320); };
  const continueNext = () => {
    if (isScoredQuestion && submissionCorrect !== true) return;
    completeScreen(screen.id, module.id, next?.id, !next);
    void stopNarration();
    if (next) navigate(next.id, 'forward'); else router.replace(`/module/${module.id}/complete` as Href);
  };
  const play = async () => {
    if (narrationState === 'pause') { await stopNarration(); setNarrationState('replay'); return; }
    if (narrationState === 'replay') { await replayNarration(); setNarrationState('pause'); return; }
    const voice = await speakScreen(screen, state.language, state.narrationRate, state.voiceByLocale[state.language], state.narrationPitch);
    if (voice) { setVoice(state.language, voice); setNarrationState('pause'); }
    else Alert.alert(
      state.language === 'es' ? 'Voz no disponible' : 'Narration voice unavailable',
      state.language === 'es' ? 'Revise los ajustes de idioma o voz del dispositivo. Puede continuar leyendo la lección.' : 'Check the device language or speech settings. You can continue reading the lesson.',
    );
  };
  const narrationLabel = narrationState === 'pause' ? t('stop') : narrationState === 'replay' ? t('replay') : state.language === 'es' ? 'Escuchar' : 'Listen';
  const narrationIcon = narrationState === 'pause' ? 'pause' : narrationState === 'replay' ? 'replay' : narrationState === 'unavailable' ? 'volume-off' : 'volume-high';
  const nextLabel = isReflection && !submittedNow ? t('skipOptional') : next ? t('next') : t('completeModule');
  return <AppScreen contentStyle={styles.lessonContent}>
    <View style={styles.topRow}><Pressable accessibilityRole="button" accessibilityLabel={`${t('backToModule')}: ${module.shortTitle}`} onFocus={() => setHomeFocused(true)} onBlur={() => setHomeFocused(false)} onPress={() => { void (async () => { await saveNow(); await stopNarration(); router.replace(`/module/${module.id}` as Href); })(); }} style={({ pressed }) => [styles.back, homeFocused && styles.focused, pressed && styles.pressed]}><MaterialCommunityIcons name="arrow-left" size={20} color={palette.ink} /><Text style={styles.backModule}>{module.shortTitle}</Text></Pressable><Text style={styles.step}>{state.language === 'es' ? 'Paso' : 'Step'} {index + 1} {state.language === 'es' ? 'de' : 'of'} {module.screens.length}</Text></View>
    <ProgressMeter compact value={Math.round(((index + 1) / module.screens.length) * 100)} label={`${state.language === 'es' ? 'Paso' : 'Step'} ${index + 1} ${state.language === 'es' ? 'de' : 'of'} ${module.screens.length}`} />
    <View style={styles.controls}>
      {previous ? <ActionButton wrapperStyle={styles.controlSlot} buttonStyle={[styles.controlButton, styles.previousControlButton]} variant="secondary" label={t('previous')} icon="arrow-left" iconColor={palette.body} textColor={palette.body} textStyle={styles.controlText} onPress={() => navigate(previous.id, 'backward')} /> : <View style={styles.controlSpacer} />}
      <ActionButton wrapperStyle={styles.controlNarration} buttonStyle={styles.controlButton} variant="primary" label={narrationLabel} icon={narrationIcon} iconColor={palette.onPrimary} textStyle={styles.narrationText} disabled={!state.narrationEnabled || narrationState === 'unavailable'} onPress={() => void play()} />
      <ActionButton wrapperStyle={styles.controlSlot} buttonStyle={styles.controlButton} label={nextLabel} icon={isReflection && !submittedNow ? 'arrow-right' : next ? 'arrow-right' : 'check'} iconPosition="trailing" textStyle={styles.controlText} disabled={!canContinue} onPress={continueNext} />
    </View>
    <Animated.View testID="lesson-surface" style={[isObjectiveQuestion ? styles.lessonSurface : styles.lessonSurfaceTransparent, { opacity: transition, transform: [{ translateX: transition.interpolate({ inputRange: [0, 1], outputRange: [entryOffset, 0] }) }] }]}>{isObjectiveQuestion ? <GradientSurface /> : null}<LessonRenderer screen={screen} onOpenVelaActivity={(activity, text) => {
      setPendingVelaActivity({ activityId: activity.id, text });
      router.push({ pathname: '/ai', params: { activityId: activity.id, kind: activity.activityKind, returnTo: `/lesson/${module.id}/${screen.id}` } } as Href);
    }} onEditingChange={(editing) => {
      if (editing) {
        setSubmittedNow(false);
        setSubmissionCorrect(false);
      }
    }} onSubmitted={(correct) => {
      setSubmittedNow(true);
      setSubmissionCorrect(correct === true);
      if (!isScoredQuestion || correct === true) completeScreen(screen.id, module.id, next?.id, !next);
      if (state.narrationEnabled && 'feedback' in screen && screen.feedback && screen.questionKind !== 'reflection') void speakFeedback(screen.feedback, state.language, state.narrationRate, state.voiceByLocale[state.language], state.narrationPitch);
    }} /></Animated.View>
  </AppScreen>;
}
const styles = StyleSheet.create({
  lessonContent: { gap: 12, paddingTop: Platform.OS === 'web' ? 54 : 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm }, back: { width: 132, maxWidth: '100%', minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 0, paddingLeft: 16, paddingRight: 0, borderRadius: radius.sm }, backModule: { color: palette.ink, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 18, fontWeight: '600' }, iconButton: { width: touchTarget, height: touchTarget, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: palette.border, borderRadius: radius.md }, focused: { outlineWidth: 2, outlineColor: palette.focus, outlineOffset: 2 }, pressed: { opacity: 0.72 },
  step: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  eyebrow: { color: palette.primary, fontFamily: fontFamily.body, fontSize: 13, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  lessonIntro: { gap: spacing.md },
  title: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 29, lineHeight: 36, fontWeight: '900', letterSpacing: -0.4 },
  controls: { flexDirection: 'row', gap: 6, alignItems: 'stretch' },
  controlSlot: { flex: 1, minWidth: 0 },
  controlNarration: { flex: 0.68, minWidth: 0 },
  controlButton: { width: '100%', minWidth: 0, paddingHorizontal: 4 }, previousControlButton: { backgroundColor: palette.raised, borderColor: 'rgba(255,255,255,0.1)' }, controlText: { fontSize: 14, lineHeight: 18, fontWeight: '600' }, narrationText: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  controlSpacer: { flex: 1 },
  lessonSurface: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: radius.lg, paddingHorizontal: 17, paddingVertical: 20, overflow: 'hidden' },
  lessonSurfaceTransparent: { backgroundColor: 'transparent' },
});
