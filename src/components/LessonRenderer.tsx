import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import type { LessonScreen } from '@/src/types/content';
import { useApp } from '@/src/state/AppProvider';
import { evaluateQuestion, questionChoiceState } from '@/src/utils/questions';
import { ActionButton, GradientSurface } from './ui';
import { fontFamily, palette, radius, spacing, touchTarget } from '@/src/theme/tokens';
import { CurriculumImage } from './CurriculumImage';
import { LessonImageRow } from './LessonImageRow';
import { LessonVideoCard } from './LessonVideoCard';
import { imagesForLesson } from '@/src/content/image-registry';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useVelaNudgeSuppression } from './VelaMascot';

function LocalReflectionRenderer({ screen, onSubmitted }: { screen: Extract<LessonScreen, { type: 'reflection' }>; onSubmitted: () => void }) {
  const { t } = useTranslation();
  const { state, loaded, saveReflectionDraft, saveReflection } = useApp();
  const storedText = state.savedReflections[screen.id]?.text ?? '';
  const [text, setText] = useState(state.reflectionDrafts[screen.id] ?? storedText);
  const [savedText, setSavedText] = useState(storedText);
  const [editing, setEditing] = useState(!storedText);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const initialisedKey = useRef<string | null>(null);

  useEffect(() => {
    if (!loaded) return;
    if (initialisedKey.current === screen.id) return;
    const nextSaved = state.savedReflections[screen.id]?.text ?? '';
    setSavedText(nextSaved);
    setText(state.reflectionDrafts[screen.id] ?? nextSaved);
    setEditing(!nextSaved);
    initialisedKey.current = screen.id;
  }, [loaded, screen.id, state.reflectionDrafts, state.savedReflections]);

  const save = async () => {
    const trimmed = text.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setSaveError(false);
    saveReflectionDraft(screen.id, text);
    try {
      await saveReflection(screen.id, text);
      setSavedText(text);
      setEditing(false);
      onSubmitted();
    } catch {
      // The draft remains in state and in the input so a storage failure cannot
      // discard a response the learner has already written.
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };
  const edit = () => {
    setText(savedText);
    setSaveError(false);
    setEditing(true);
  };
  const cancel = () => {
    setText(savedText);
    setSaveError(false);
    setEditing(false);
  };
  if (!editing && savedText) return <View testID="reflection-card" style={[styles.stack, styles.reflectionStack, styles.reflectionCard]}>
    <GradientSurface />
    <Text accessibilityRole="header" style={styles.lessonTitle}>{screen.title}</Text>
    {screen.contextParagraphs?.map((paragraph, index) => <Text key={index} style={styles.body}>{paragraph}</Text>)}
    <Text style={styles.reflectionPrompt}>{screen.prompt}</Text>
    {screen.instructions ? <Text style={styles.reflectionInstruction}>{screen.instructions}</Text> : null}
    <View testID="reflection-saved-card" accessibilityLiveRegion="polite" style={styles.reflectionSavedCard}>
      <Text style={styles.savedLocallyLabel}>{t('savedLocally').toUpperCase()}</Text>
      <Text style={styles.savedLocallyBody}>{t('savedLocally')}</Text>
      <View style={styles.savedReflectionText}><Text style={styles.reflectionInputText}>{savedText}</Text></View>
      <ActionButton variant="secondary" label={t('editReflection')} icon="pencil-outline" onPress={edit} />
      <Text style={styles.reflectionPrivacy}>{t('reflectionDiscussBody')}</Text>
    </View>
  </View>;

  return <View testID="reflection-card" style={[styles.stack, styles.reflectionStack, styles.reflectionCard]}>
    <GradientSurface />
    <Text accessibilityRole="header" style={styles.lessonTitle}>{screen.title}</Text>
    {screen.contextParagraphs?.map((paragraph, index) => <Text key={index} style={styles.body}>{paragraph}</Text>)}
    <Text style={styles.reflectionPrompt}>{screen.prompt}</Text>
    {screen.instructions ? <Text style={styles.reflectionInstruction}>{screen.instructions}</Text> : null}
    <TextInput
      testID="reflection-input"
      accessibilityLabel={screen.prompt}
      multiline
      value={text}
      placeholder={screen.placeholder ?? t('reflectionPlaceholder')}
      placeholderTextColor={palette.inkMuted}
      onChangeText={(value) => { setText(value); saveReflectionDraft(screen.id, value); setSaveError(false); }}
      style={styles.reflectionInput}
      textAlignVertical="top"
      maxLength={2000}
    />
    <View testID="reflection-privacy-note" style={styles.reflectionPrivacyRow}>
      <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="lock-outline" size={16} color={palette.inkMuted} />
      <Text style={styles.reflectionPrivacy}>{t('reflectionPrivacy')}</Text>
    </View>
    {saveError ? <View testID="reflection-save-error" accessibilityRole="alert" style={styles.reflectionSaveError}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="alert-circle-outline" size={20} color={palette.danger} /><Text style={styles.reflectionSaveErrorText}>{t('saveFailed')}</Text><ActionButton compact variant="secondary" icon="reload" accessibilityLabel={t('retrySave')} label={t('retrySave')} onPress={() => void save()} /></View> : null}
    <ActionButton testID="reflection-save" label={t('saveReflection')} icon="arrow-right" iconPosition="trailing" disabled={!text.trim() || saving} onPress={() => void save()} />
    {savedText ? <ActionButton variant="secondary" label={t('cancel')} icon="close" onPress={cancel} /> : null}
  </View>;
}

function VelaActivityRenderer({ screen, onOpen }: { screen: Extract<LessonScreen, { type: 'aiActivity' }>; onOpen?: (screen: Extract<LessonScreen, { type: 'aiActivity' }>, text: string) => void }) {
  const { t } = useTranslation();
  const { state } = useApp();
  const [text, setText] = useState('');
  const canOpen = Boolean(text.trim() && onOpen);
  return <View testID={`vela-activity-${screen.activityId}`} style={[styles.stack, styles.velaActivity]}>
    <Text accessibilityRole="header" style={styles.lessonTitle}>{screen.title}</Text>
    <Text style={styles.prompt}>{screen.prompt}</Text>
    <TextInput
      testID={`vela-activity-input-${screen.activityId}`}
      accessibilityLabel={screen.prompt}
      multiline
      value={text}
      onChangeText={setText}
      placeholder={screen.placeholder ?? t('velaActivityPlaceholder')}
      placeholderTextColor={palette.inkMuted}
      textAlignVertical="top"
      maxLength={2000}
      style={styles.velaActivityInput}
    />
    <View testID="vela-activity-privacy-note" style={styles.reflectionPrivacyRow}>
      <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="lock-outline" size={16} color={palette.inkMuted} />
      <Text style={styles.reflectionPrivacy}>{state.aiConsent ? t('velaActivitySendNotice') : t('velaActivityConsentNotice')}</Text>
    </View>
    <Text style={styles.body}>{t('chatPrivacyNotice')}</Text>
    <ActionButton testID={`vela-activity-ask-${screen.activityId}`} label={t('askVela')} icon="message-text-outline" iconPosition="trailing" disabled={!canOpen} onPress={() => { if (text.trim()) onOpen?.(screen, text.trim()); }} />
  </View>;
}

export function LessonRenderer({ screen, onSubmitted, onEditingChange, onOpenVelaActivity }: { screen: LessonScreen; onSubmitted: (correct?: boolean) => void; onEditingChange?: (editing: boolean) => void; onOpenVelaActivity?: (screen: Extract<LessonScreen, { type: 'aiActivity' }>, text: string) => void }) {
  const { t } = useTranslation();
  const { state, saveAnswer, submitAnswer } = useApp();
  const reducedMotion = useReducedMotion();
  useVelaNudgeSuppression('lesson-interaction', screen.type !== 'content' && screen.type !== 'summary');
  const saved = useMemo(() => state.answers[screen.id] ?? [], [screen.id, state.answers]);
  const priorAttempt = state.answerAttempts[screen.id]?.at(-1);
  const [selected, setSelected] = useState<string[]>(saved);
  const [submitted, setSubmitted] = useState(Boolean(priorAttempt));
  const [editing, setEditing] = useState(false);
  const [focusedChoice, setFocusedChoice] = useState<string | null>(null);

  useEffect(() => {
    if (editing) return;
    setSelected(saved);
    setSubmitted(Boolean(state.answerAttempts[screen.id]?.length));
    setEditing(false);
  }, [editing, saved, screen.id, state.answerAttempts]);

  if (screen.type === 'content') {
    const assets = screen.sourceIds?.includes('cias-screenshot-recovery') ? [] : imagesForLesson(screen.id);
    const numbered = screen.paragraphs.some((paragraph) => /\b1\.\s/.test(paragraph));
    return <View style={styles.stack}>
    <Text accessibilityRole="header" style={styles.lessonTitle}>{screen.title}</Text>
    <View style={styles.contentCard}>
    <GradientSurface />
    {assets.length > 1 ? <LessonImageRow assets={assets} locale={state.language} /> : assets[0] ? <CurriculumImage asset={assets[0]} locale={state.language} /> : null}
    {screen.video ? <LessonVideoCard video={screen.video} locale={state.language} /> : null}
    {screen.paragraphs.map((paragraph, index) => <View key={index} style={numbered ? styles.timelineRow : undefined}>
      {numbered ? <View style={styles.timelineDot}><Text style={styles.timelineNumber}>{index + 1}</Text></View> : null}
      <Text style={[styles.body, numbered && styles.timelineCopy]}>{paragraph}</Text>
    </View>)}
    {screen.orderedList ? <View accessibilityRole="list" accessibilityLabel={state.language === 'es' ? `Lista ordenada de ${screen.orderedList.length} elementos` : `${screen.orderedList.length}-item ordered list`} style={styles.orderedList}>{screen.orderedList.map((item, index) => <View key={item} style={styles.orderedItem}><Text style={styles.orderedNumber}>{index + 1}.</Text><Text style={styles.orderedText}>{item}</Text></View>)}</View> : null}
    {screen.keyPoints?.length ? <View style={styles.takeaway}><Text style={styles.takeawayLabel}>{state.language === 'es' ? 'PUNTO CLAVE' : 'KEY POINT'}</Text>{screen.keyPoints.map((point, index) => <View key={index} style={styles.point}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check-circle-outline" size={22} color={palette.accent} /><Text style={styles.pointText}>{point}</Text></View>)}</View> : null}
    {screen.sourceVisibleLabels?.length ? <View style={styles.takeaway}><Text style={styles.takeawayLabel}>SOURCE-VISIBLE LABELS</Text>{screen.sourceVisibleLabels.map((label, index) => <View key={index} style={styles.point}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="label-outline" size={22} color={palette.accent} /><Text style={styles.pointText}>{label}</Text></View>)}</View> : null}
    {['m1-01', 'm1-07'].includes(screen.id) ? <Pressable accessibilityRole="link" accessibilityLabel={state.language === 'es' ? 'Fuente de apoyo: NHLBI sobre la apnea del sueño' : 'Supporting source: NHLBI Sleep Apnea'} onPress={() => void Linking.openURL('https://www.nhlbi.nih.gov/health/sleep-apnea')} style={styles.sourceLinkButton}><Text style={styles.sourceLink}>{state.language === 'es' ? 'Fuente de apoyo: NHLBI sobre la apnea del sueño' : 'Supporting source: NHLBI Sleep Apnea'}</Text></Pressable> : null}
    </View>
  </View>;
  }

  if (screen.type === 'summary') return <View style={styles.stack}><Text accessibilityRole="header" style={styles.lessonTitle}>{screen.title}</Text>{imagesForLesson(screen.id).map((asset) => <CurriculumImage key={asset.id} asset={asset} locale={state.language} />)}<View style={styles.summaryList}>{screen.keyPoints.map((point, index) =>
    <View key={index} style={styles.summaryRow}><GradientSurface /><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check-circle-outline" size={24} color={palette.success} /><Text style={styles.pointText}>{point}</Text></View>)}
  </View>{screen.sourceVisibleLabels?.length ? <View style={styles.takeaway}><Text style={styles.takeawayLabel}>SOURCE-VISIBLE LABELS</Text>{screen.sourceVisibleLabels.map((label, index) => <View key={index} style={styles.point}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="label-outline" size={22} color={palette.accent} /><Text style={styles.pointText}>{label}</Text></View>)}</View> : null}</View>;

  if (screen.type === 'aiActivity') return <VelaActivityRenderer screen={screen} onOpen={onOpenVelaActivity} />;

  if (screen.type === 'reflection') return <LocalReflectionRenderer screen={screen} onSubmitted={() => onSubmitted()} />;

  const question = screen;
  const isUnscoredSourceQuestion = question.answerBehaviorProvenance === 'CIAS_ANSWER_KEY_NOT_RECOVERED';
  const isChoiceReflection = question.questionKind === 'reflection' || isUnscoredSourceQuestion;
  const isSavedResponse = isChoiceReflection;
  const showQuestionTitle = isChoiceReflection || (isUnscoredSourceQuestion && question.title !== question.prompt);
  const currentResult = submitted && !editing ? evaluateQuestion(question, selected) : undefined;
  const objective = evaluateQuestion(question, selected) !== undefined || (
    question.type !== 'scenario' && question.questionKind === 'objective'
  );
  const unscored = isSavedResponse || !objective;
  const toggle = (id: string) => {
    if (Platform.OS !== 'web' && !reducedMotion) void Haptics.selectionAsync();
    const updated = question.type === 'singleChoice'
      ? [id]
      : selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id];
    setSelected(updated);
    saveAnswer(question.id, updated);
  };
  const submit = () => {
    const correct = isSavedResponse ? undefined : evaluateQuestion(question, selected);
    submitAnswer(question.id, selected, correct);
    setSubmitted(true);
    setEditing(false);
    onEditingChange?.(false);
    onSubmitted(correct);
    if (Platform.OS !== 'web' && !reducedMotion) void Haptics.notificationAsync(correct === false ? Haptics.NotificationFeedbackType.Warning : Haptics.NotificationFeedbackType.Success);
  };

  const summary = currentResult === true
    ? question.questionFeedback?.correctSummary ?? t('correct')
    : currentResult === false
      ? question.questionFeedback?.incorrectSummary ?? t('notQuite')
      : t('reflectionSaved');
  const explanation = question.questionFeedback?.generalExplanation ?? question.feedback ?? t('answerSaved');

  const choiceList = question.choices.map((choice) => {
      const active = selected.includes(choice.id);
      const showResults = submitted && !editing && objective && !unscored;
      const locked = submitted && !editing;
      const choiceState = questionChoiceState(question, selected, choice.id);
      // A failed attempt may identify the learner's selected error, but it
      // must not reveal any unselected correct choice or answer-key text.
      const missed = showResults && currentResult === true && choiceState.missed;
      const incorrectSelected = showResults && currentResult === false && choiceState.incorrectSelected;
      const correctSelected = showResults && currentResult === true && choiceState.correctSelected;
      return <Pressable
        key={choice.id}
        testID={`choice-${question.id}-${choice.id}`}
        accessibilityRole={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
        accessibilityState={{ selected: active, checked: active, disabled: locked }}
        disabled={locked}
        aria-checked={active}
        aria-selected={active}
        accessibilityLabel={`${choice.label}${!isChoiceReflection && missed ? `, ${t('missedCorrectChoice')}` : ''}`}
        onFocus={() => setFocusedChoice(choice.id)}
        onBlur={() => setFocusedChoice(null)}
        onPress={locked ? undefined : () => toggle(choice.id)}
        style={({ pressed }) => [
           styles.choice,
           isChoiceReflection && styles.reflectionChoice,
           active && (isChoiceReflection ? styles.reflectionChoiceActive : styles.choiceActive),
          missed && styles.choiceMissed,
          incorrectSelected && styles.choiceIncorrect,
          correctSelected && styles.choiceCorrect,
          focusedChoice === choice.id && styles.choiceFocused,
          pressed && styles.pressed,
        ]}>
        {!active && !missed && !incorrectSelected && !correctSelected ? <GradientSurface /> : null}
        <MaterialCommunityIcons accessible={false} importantForAccessibility="no"
          name={question.type === 'singleChoice' ? (active ? 'radiobox-marked' : 'radiobox-blank') : (active ? 'checkbox-marked' : 'checkbox-blank-outline')}
          size={25}
           color={correctSelected ? palette.success : incorrectSelected ? palette.danger : missed ? palette.missed : active ? palette.primary : palette.inkMuted}
         />
         <View style={styles.choiceCopy}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{choice.label}</Text>
          {correctSelected ? <Text style={styles.correctLabel}>{t('correctChoice')}</Text> : null}
          {incorrectSelected ? <Text style={styles.incorrectLabel}>{t('incorrectChoice')}</Text> : null}
          {missed ? <Text style={styles.missedLabel}>{t('missedCorrectChoice')}</Text> : null}
          {currentResult === true && question.questionFeedback?.optionExplanations?.[choice.id] ? <Text style={styles.optionExplanation}>{question.questionFeedback.optionExplanations[choice.id]}</Text> : null}
        </View>
      </Pressable>;
     });
  const reflectionInstruction = question.type === 'multiSelect' ? t('reflectionMultiInstruction') : t('reflectionSingleInstruction');
  const submitLabel = isChoiceReflection
    ? question.type === 'multiSelect' ? t('saveResponses', { count: selected.length }) : t('saveResponse')
    : question.type === 'multiSelect' ? t('submitAnswers', { count: selected.length }) : t('submit');
  return <View style={[styles.stack, styles.questionStack]}>
    <Text style={styles.questionCue}>{isChoiceReflection ? t('personalReflection') : state.language === 'es' ? 'COMPROBAR COMPRENSIÓN' : 'CHECK YOUR UNDERSTANDING'}</Text>
    <Text accessibilityRole="header" aria-hidden={!showQuestionTitle} style={showQuestionTitle ? styles.lessonTitle : styles.srOnly}>{question.title}</Text>
    {question.type === 'scenario' ? <Text style={styles.body}>{question.scenario}</Text> : null}
    {'contextParagraphs' in question ? question.contextParagraphs?.map((paragraph, index) => <Text key={index} style={styles.body}>{paragraph}</Text>) : null}
    <Text style={styles.prompt}>{question.prompt}</Text>
    {'instructions' in question && question.instructions && question.instructions !== question.prompt ? <Text style={styles.reflectionInstruction}>{question.instructions}</Text> : null}
    {isChoiceReflection ? <Text style={styles.reflectionInstruction}>{reflectionInstruction}</Text> : null}
    {isChoiceReflection ? <Text testID="reflection-privacy-note" style={styles.reflectionPrivacy}>{t('reflectionPrivacy')}</Text> : null}
    {isChoiceReflection ? <View testID="reflection-choice-panel" style={styles.reflectionChoicePanel}><GradientSurface />{choiceList}</View> : choiceList}
    {(!submitted || editing) ? <>
      <ActionButton label={submitLabel} icon="arrow-right" iconPosition="trailing" disabled={selected.length === 0} onPress={submit} />
    </> : <>
      <View accessibilityLiveRegion="polite" style={[
        styles.feedback,
        isSavedResponse && styles.feedbackSaved,
        !isSavedResponse && currentResult === true && styles.feedbackCorrect,
        !isSavedResponse && currentResult === false && styles.feedbackIncorrect,
      ]}>
        <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={isSavedResponse || currentResult === true ? 'check-circle-outline' : currentResult === false ? 'alert-circle-outline' : 'heart-outline'} size={24} color={isSavedResponse || currentResult === true ? palette.success : currentResult === false ? palette.danger : palette.primaryDark} />
        <View style={styles.feedbackCopy}><Text style={styles.feedbackTitle}>{isSavedResponse ? t('reflectionSaved') : summary}</Text>{!isSavedResponse && currentResult !== false ? <Text style={styles.feedbackText}>{explanation}</Text> : null}</View>
      </View>
      <ActionButton variant="secondary" accessibilityLabel={currentResult === false ? `${isChoiceReflection ? t('editReflection') : question.type === 'multiSelect' ? t('changeAnswers') : t('changeAnswer')} (${t('retry')})` : undefined} label={isChoiceReflection ? t('editReflection') : question.type === 'multiSelect' ? t('changeAnswers') : t('changeAnswer')} icon="arrow-right" iconPosition="trailing" onPress={() => { setEditing(true); onEditingChange?.(true); }} />
    </>}
  </View>;
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  velaActivity: { gap: spacing.md },
  questionStack: { gap: 12 },
  contentCard: { gap: spacing.md, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: radius.lg, padding: 18, overflow: 'hidden' },
  lessonTitle: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 23, lineHeight: 29, fontWeight: '800', letterSpacing: -0.2 },
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
  body: { color: palette.white, fontFamily: fontFamily.body, fontSize: 18, lineHeight: 29 },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  pointText: { flex: 1, color: palette.white, fontFamily: fontFamily.body, fontSize: 17, lineHeight: 27 },
  summaryList: { gap: spacing.sm },
  summaryRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', borderWidth: 1, borderColor: palette.border, borderRadius: 16, padding: 14, backgroundColor: 'transparent', overflow: 'hidden' },
  questionCue: { color: palette.inkMuted, fontSize: 10, lineHeight: 14, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase' },
  prompt: { color: palette.white, fontFamily: fontFamily.heading, fontSize: 20, lineHeight: 28, fontWeight: '800' },
  takeaway: { gap: spacing.sm, borderLeftWidth: 4, borderLeftColor: palette.accent, backgroundColor: palette.accentSoft, borderRadius: radius.md, padding: spacing.md },
  takeawayLabel: { color: palette.accent, fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  timelineDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  timelineNumber: { color: palette.primary, fontSize: 13, fontWeight: '900' },
  timelineCopy: { flex: 1 },
  orderedList: { gap: spacing.md, paddingLeft: spacing.md },
  orderedItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  orderedNumber: { width: 28, color: palette.primaryDark, fontSize: 18, lineHeight: 29, fontWeight: '900' },
  orderedText: { flex: 1, color: palette.white, fontFamily: fontFamily.body, fontSize: 18, lineHeight: 29 },
  sourceLinkButton: { minHeight: touchTarget, justifyContent: 'center' },
  sourceLink: { color: palette.accent, textDecorationLine: 'underline', fontSize: 14, lineHeight: 21, fontWeight: '700' },
  choice: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: palette.inkMuted, backgroundColor: 'transparent', borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, overflow: 'hidden' },
  choiceActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  choiceCorrect: { borderColor: palette.success, backgroundColor: palette.successSoft },
  choiceIncorrect: { borderColor: palette.danger, backgroundColor: palette.dangerSoft },
  choiceMissed: { borderColor: palette.warning, borderStyle: 'dashed', backgroundColor: palette.warningSoft },
  choiceFocused: { outlineWidth: 2, outlineColor: palette.focus, outlineOffset: 2 },
  choiceCopy: { flex: 1, gap: spacing.xs },
  choiceText: { color: palette.white, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 20, fontWeight: '400' },
  choiceTextActive: { color: palette.white, fontWeight: '600' },
  correctLabel: { color: palette.success, fontSize: 13, fontWeight: '800' },
  incorrectLabel: { color: palette.danger, fontSize: 13, fontWeight: '800' },
  missedLabel: { color: palette.warning, fontSize: 13, fontWeight: '800' },
  optionExplanation: { color: palette.white, fontSize: 14, lineHeight: 20 },
  feedback: { flexDirection: 'row', gap: 8, backgroundColor: palette.surfaceSoft, borderRadius: radius.md, padding: 14 },
  feedbackCorrect: { backgroundColor: palette.successSoft },
  feedbackIncorrect: { backgroundColor: palette.dangerSoft },
  feedbackCopy: { flex: 1, gap: 8 },
  feedbackTitle: { color: palette.white, fontFamily: fontFamily.heading, fontSize: 15, lineHeight: 20, fontWeight: '800' },
  feedbackText: { color: palette.white, fontFamily: fontFamily.body, fontSize: 13.5, lineHeight: 20 },
  reflectionInstruction: { color: palette.white, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20 },
  reflectionPrivacy: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 12, lineHeight: 18 },
  reflectionStack: {},
  reflectionCard: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', borderRadius: 24, padding: 18, paddingBottom: 0, gap: 10, overflow: 'hidden' },
  reflectionPrompt: { color: palette.white, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 23 },
  reflectionInput: { minHeight: 120, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 14, color: palette.white, backgroundColor: palette.raised, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 22 },
  reflectionPrivacyRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reflectionSaveError: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: palette.dangerSoft },
  reflectionSaveErrorText: { flex: 1, color: palette.danger, fontFamily: fontFamily.body, fontSize: 13, lineHeight: 19 },
  reflectionSavedCard: { gap: spacing.sm, borderWidth: 1, borderColor: palette.success, borderRadius: 20, padding: spacing.md, backgroundColor: palette.background },
  savedLocallyLabel: { color: palette.success, fontFamily: fontFamily.body, fontSize: 11, lineHeight: 15, fontWeight: '800', letterSpacing: 0.8 },
  savedLocallyBody: { color: palette.white, fontFamily: fontFamily.body, fontSize: 13, lineHeight: 18 },
  savedReflectionText: { minHeight: 122, borderWidth: 1, borderColor: palette.success, borderRadius: 16, padding: 13, backgroundColor: palette.raised },
  reflectionInputText: { color: palette.white, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 21 },
  velaActivityInput: { minHeight: 132, borderWidth: 1, borderColor: palette.border, borderRadius: 16, padding: 13, color: palette.white, backgroundColor: palette.raised, fontFamily: fontFamily.body, fontSize: 16, lineHeight: 23 },
  reflectionChoicePanel: { gap: 8, borderWidth: 1, borderColor: palette.border, borderRadius: 24, padding: 17, backgroundColor: 'transparent', overflow: 'hidden' },
  reflectionChoice: { backgroundColor: 'transparent', borderColor: palette.inkMuted, borderRadius: 16 },
  reflectionChoiceActive: { backgroundColor: palette.reflectionSelected, borderColor: palette.primary },
  feedbackSaved: { backgroundColor: palette.successSoft, borderWidth: 1, borderColor: palette.success },
  pressed: { opacity: 0.72 },
});
