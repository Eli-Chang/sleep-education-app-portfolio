import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import type { LessonScreen } from '@/src/types/content';
import { useApp } from '@/src/state/AppProvider';
import { evaluateQuestion, questionChoiceState } from '@/src/utils/questions';
import { ActionButton } from './ui';
import { fontFamily, palette, radius, spacing, touchTarget, type as typeScale } from '@/src/theme/tokens';
import { CurriculumImage } from './CurriculumImage';
import { LessonImageRow } from './LessonImageRow';
import { LessonVideoCard } from './LessonVideoCard';
import { imagesForLesson } from '@/src/content/image-registry';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { richPresentation } from '@/src/content/rich-presentation';
import { useVelaNudgeSuppression } from './VelaMascot';

const ChoicePressable = Pressable as React.ComponentType<any>;
const RichListItemView = View as React.ComponentType<any>;

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
  const saved = useMemo(() => state.answers[screen.id] ?? [], [screen.id, state.answers]);
  const priorAttempt = state.answerAttempts[screen.id]?.at(-1);
  const [selected, setSelected] = useState<string[]>(saved);
  const [submitted, setSubmitted] = useState(Boolean(priorAttempt));
  const [editing, setEditing] = useState(false);
  const [focusedChoice, setFocusedChoice] = useState<string | null>(null);
  const choiceRefs = useRef<Record<string, { focus?: () => void } | null>>({});
  useVelaNudgeSuppression('lesson-interaction', screen.type !== 'content' && screen.type !== 'summary');

  useEffect(() => {
    if (editing) return;
    setSelected(saved);
    setSubmitted(Boolean(state.answerAttempts[screen.id]?.length));
    setEditing(false);
  }, [editing, saved, screen.id, state.answerAttempts]);

  if (screen.type === 'content') {
    const sourceRecovered = screen.sourceIds?.includes('cias-screenshot-recovery');
    const assets = imagesForLesson(screen.id).filter((asset) => !sourceRecovered);
    const presentation = richPresentation(screen);
    return <View style={styles.stack}>
    <Text accessibilityRole="header" style={styles.lessonTitle}>{screen.title}</Text>
    <View style={styles.contentCard}>
    {assets.length ? <View style={styles.mediaBleed}>{assets.length > 1 ? <LessonImageRow assets={assets} locale={state.language} /> : <CurriculumImage asset={assets[0]} locale={state.language} />}</View> : null}
    {screen.video ? <LessonVideoCard video={screen.video} locale={state.language} /> : null}
    {presentation.map((block, index) => block.type === 'paragraph'
      ? <Text key={index} style={styles.body}>{block.segments.map((segment, segmentIndex) => <Text key={segmentIndex} style={segment.bold ? styles.boldText : undefined}>{segment.text}</Text>)}</Text>
      : <View key={index} accessibilityRole="list" accessibilityLabel={state.language === 'es' ? `Lista de ${block.items.length} elementos` : `${block.items.length}-item list`} style={styles.unorderedList}>{block.items.map((item, itemIndex) => <RichListItemView key={itemIndex} role="listitem" style={styles.unorderedItem}><Text accessible={false} style={styles.unorderedBullet}>•</Text><Text style={styles.unorderedText}>{item.map((segment, segmentIndex) => <Text key={segmentIndex} style={segment.bold ? styles.boldText : undefined}>{segment.text}</Text>)}</Text></RichListItemView>)}</View>)}
    {screen.orderedList ? <View accessibilityRole="list" accessibilityLabel={state.language === 'es' ? `Lista ordenada de ${screen.orderedList.length} elementos` : `${screen.orderedList.length}-item ordered list`} style={styles.orderedList}>{screen.orderedList.map((item, index) => <RichListItemView key={item} role="listitem" style={styles.orderedItem}><Text style={styles.orderedNumber}>{index + 1}.</Text><Text style={styles.orderedText}>{item}</Text></RichListItemView>)}</View> : null}
    {screen.keyPoints?.length ? <View style={styles.takeaway}><View style={styles.takeawayHeader}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="lightbulb-on-outline" size={17} color={palette.dawnInk} /><Text style={styles.takeawayLabel}>{state.language === 'es' ? 'PUNTO CLAVE' : 'KEY POINT'}</Text></View>{screen.keyPoints.map((point, index) => <View key={index} style={styles.point}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check-circle-outline" size={22} color={palette.primary} /><Text style={styles.pointText}>{point}</Text></View>)}</View> : null}
    {screen.sourceVisibleLabels?.length ? <View style={styles.takeaway}><Text style={styles.takeawayLabel}>SOURCE-VISIBLE LABELS</Text>{screen.sourceVisibleLabels.map((label, index) => <View key={index} style={styles.point}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="label-outline" size={22} color={palette.primary} /><Text style={styles.pointText}>{label}</Text></View>)}</View> : null}
    {['m1-01', 'm1-07'].includes(screen.id) ? <Pressable accessibilityRole="link" accessibilityLabel={state.language === 'es' ? 'Fuente de apoyo: NHLBI sobre la apnea del sueño' : 'Supporting source: NHLBI Sleep Apnea'} onPress={() => void Linking.openURL('https://www.nhlbi.nih.gov/health/sleep-apnea')} style={styles.sourceLinkButton}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="open-in-new" size={17} color={palette.primary} /><Text style={styles.sourceLink}>{state.language === 'es' ? 'Fuente de apoyo: NHLBI sobre la apnea del sueño' : 'Supporting source: NHLBI Sleep Apnea'}</Text></Pressable> : null}
    </View>
  </View>;
  }

  if (screen.type === 'aiActivity') return <VelaActivityRenderer screen={screen} onOpen={onOpenVelaActivity} />;
  if (screen.type === 'summary') return <View style={styles.stack}><Text accessibilityRole="header" style={styles.lessonTitle}>{screen.title}</Text>{imagesForLesson(screen.id).filter((asset) => !screen.sourceIds?.includes('cias-screenshot-recovery')).map((asset) => <CurriculumImage key={asset.id} asset={asset} locale={state.language} />)}<View style={styles.summaryList}>{screen.keyPoints.map((point, index) =>
    <View key={index} style={styles.summaryRow}><View style={styles.summaryCheck}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check" size={16} color={palette.white} /></View><Text style={styles.pointText}>{point}</Text></View>)}
  </View>{screen.sourceVisibleLabels?.length ? <View style={styles.takeaway}><Text style={styles.takeawayLabel}>SOURCE-VISIBLE LABELS</Text>{screen.sourceVisibleLabels.map((label, index) => <View key={index} style={styles.point}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="label-outline" size={22} color={palette.primary} /><Text style={styles.pointText}>{label}</Text></View>)}</View> : null}</View>;

  if (screen.type === 'reflection') return <LocalReflectionRenderer screen={screen} onSubmitted={() => onSubmitted()} />;

  const question = screen;
  const isUnscoredSourceQuestion = question.answerBehaviorProvenance === 'CIAS_ANSWER_KEY_NOT_RECOVERED';
  const isChoiceReflection = question.questionKind === 'reflection' || isUnscoredSourceQuestion;
  const isSavedResponse = isChoiceReflection;
  const normalizeQuestionCopy = (value: string) => value.toLocaleLowerCase().replace(/[¿?¡!():,;.…]+/g, ' ').replace(/\s+/g, ' ').trim();
  const boilerplateQuestionCopy = /^(knowledge check|question time|check your understanding|comprehension check(?: \d+)?(?: .*)?|comprobaci[oó]n de conocimientos|comprobar comprensi[oó]n|verificaci[oó]n de comprensi[oó]n(?: \d+)?(?: .*)?|select the right answer|seleccione la respuesta correcta|true or false|verdadero o falso)( this question is for learning not a comprehension check)?$/;
  const normalizedTitle = normalizeQuestionCopy(question.title);
  const normalizedPrompt = normalizeQuestionCopy(question.prompt);
  const hasDuplicateQuestionCopy = normalizedTitle === normalizedPrompt;
  const showQuestionTitle = !hasDuplicateQuestionCopy && !boilerplateQuestionCopy.test(normalizedTitle);
  const showInstructions = 'instructions' in question && Boolean(question.instructions)
    && normalizeQuestionCopy(question.instructions ?? '') !== normalizedPrompt
    && !boilerplateQuestionCopy.test(normalizeQuestionCopy(question.instructions ?? ''));
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
    ? t('correct')
    : currentResult === false
      ? t('notQuite')
      : t('reflectionSaved');
  const selectedWrongExplanation = currentResult === false
    ? selected.map((id) => question.questionFeedback?.optionExplanations?.[id]).find(Boolean)
    : undefined;
  const explanation = selectedWrongExplanation
    ?? (currentResult === false ? question.questionFeedback?.incorrectExplanation : undefined)
    ?? question.questionFeedback?.generalExplanation
    ?? question.feedback
    ?? t('answerSaved');

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
      const resultLabel = correctSelected ? t('correctChoice') : incorrectSelected ? t('incorrectChoice') : missed ? t('missedCorrectChoice') : '';
      return <ChoicePressable
        key={choice.id}
        ref={(node: { focus?: () => void } | null) => { choiceRefs.current[choice.id] = node; }}
        testID={`choice-${question.id}-${choice.id}`}
        accessibilityRole={question.type === 'singleChoice' ? 'radio' : 'checkbox'}
        accessibilityState={{ checked: active, disabled: locked }}
        disabled={locked}
        aria-checked={active}
        accessibilityLabel={`${choice.label}${resultLabel ? `, ${resultLabel}` : ''}`}
        tabIndex={question.type === 'singleChoice' ? (active || (!selected.length && choice.id === question.choices[0]?.id) ? 0 : -1) : undefined}
        onKeyDown={(event: any) => {
          if (Platform.OS !== 'web' || question.type !== 'singleChoice' || locked) return;
          const key = event.nativeEvent.key;
          const direction = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 0;
          if (!direction) return;
          event.preventDefault();
          const currentIndex = question.choices.findIndex((candidate) => candidate.id === choice.id);
          const nextIndex = (currentIndex + direction + question.choices.length) % question.choices.length;
          const nextId = question.choices[nextIndex].id;
          toggle(nextId);
          choiceRefs.current[nextId]?.focus?.();
        }}
        onFocus={() => setFocusedChoice(choice.id)}
        onBlur={() => setFocusedChoice(null)}
        onPress={locked ? undefined : () => toggle(choice.id)}
        style={({ pressed }: { pressed: boolean }) => [
           styles.choice,
           isChoiceReflection && styles.reflectionChoice,
           active && (isChoiceReflection ? styles.reflectionChoiceActive : styles.choiceActive),
          missed && styles.choiceMissed,
          incorrectSelected && styles.choiceIncorrect,
          correctSelected && styles.choiceCorrect,
          focusedChoice === choice.id && styles.choiceFocused,
          pressed && styles.pressed,
        ]}>
        <MaterialCommunityIcons accessible={false} importantForAccessibility="no"
          name={correctSelected ? 'check-circle' : incorrectSelected ? 'close-circle' : missed ? 'alert-circle-outline' : question.type === 'singleChoice' ? (active ? 'radiobox-marked' : 'radiobox-blank') : (active ? 'checkbox-marked' : 'checkbox-blank-outline')}
          size={26}
           color={correctSelected ? palette.success : incorrectSelected ? palette.danger : missed ? palette.missed : active ? (isChoiceReflection ? palette.dawnInk : palette.primary) : palette.borderStrong}
         />
         <View style={styles.choiceCopy}><Text style={[styles.choiceText, active && styles.choiceTextActive]}>{choice.label}</Text>
          {correctSelected ? <Text style={styles.correctLabel}>{t('correctChoice')}</Text> : null}
          {incorrectSelected ? <Text style={styles.incorrectLabel}>{t('incorrectChoice')}</Text> : null}
          {missed ? <Text style={styles.missedLabel}>{t('missedCorrectChoice')}</Text> : null}
          {currentResult === true && question.questionFeedback?.optionExplanations?.[choice.id] ? <Text style={styles.optionExplanation}>{question.questionFeedback.optionExplanations[choice.id]}</Text> : null}
        </View>
      </ChoicePressable>;
     });
  const reflectionInstruction = question.type === 'multiSelect' ? t('reflectionMultiInstruction') : t('reflectionSingleInstruction');
  const submitLabel = isChoiceReflection
    ? question.type === 'multiSelect' ? t('saveResponses', { count: selected.length }) : t('saveResponse')
    : question.type === 'multiSelect' ? t('submitAnswers', { count: selected.length }) : t('submit');
  return <View style={[styles.stack, styles.questionStack]}>
    <View style={[styles.questionCueRow, isChoiceReflection && styles.questionCueReflection]}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={isChoiceReflection ? 'heart-outline' : 'head-question-outline'} size={16} color={isChoiceReflection ? palette.dawnInk : palette.primary} /><Text style={[styles.questionCue, isChoiceReflection && styles.questionCueTextReflection]}>{isChoiceReflection ? t('personalReflection') : state.language === 'es' ? 'COMPROBAR COMPRENSIÓN' : 'CHECK YOUR UNDERSTANDING'}</Text></View>
    <Text aria-hidden={!showQuestionTitle} style={showQuestionTitle ? styles.lessonTitle : styles.srOnly}>{question.title}</Text>
    {question.type === 'scenario' ? <Text style={styles.body}>{question.scenario}</Text> : null}
    {'contextParagraphs' in question ? question.contextParagraphs?.map((paragraph, index) => <Text key={index} style={styles.body}>{paragraph}</Text>) : null}
    <Text accessibilityRole="header" style={styles.prompt}>{question.prompt}</Text>
    {showInstructions && 'instructions' in question ? <Text style={styles.reflectionInstruction}>{question.instructions}</Text> : null}
    {isChoiceReflection ? <Text style={styles.reflectionInstruction}>{reflectionInstruction}</Text> : null}
    {isChoiceReflection ? <Text testID="reflection-privacy-note" style={styles.reflectionPrivacy}>{t('reflectionPrivacy')}</Text> : null}
    {isChoiceReflection ? <View testID="reflection-choice-panel" accessibilityRole={question.type === 'singleChoice' ? 'radiogroup' : undefined} accessibilityLabel={question.prompt} style={styles.reflectionChoicePanel}>{choiceList}</View> : <View accessibilityRole={question.type === 'singleChoice' ? 'radiogroup' : undefined} accessibilityLabel={question.prompt} style={styles.choiceGroup}>{choiceList}</View>}
    {(!submitted || editing) ? <>
      <ActionButton label={submitLabel} icon="arrow-right" iconPosition="trailing" disabled={selected.length === 0} onPress={submit} />
    </> : <>
      <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[
        styles.feedback,
        isSavedResponse && styles.feedbackSaved,
        !isSavedResponse && currentResult === true && styles.feedbackCorrect,
        !isSavedResponse && currentResult === false && styles.feedbackIncorrect,
      ]}>
        <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={isSavedResponse || currentResult === true ? 'check-circle' : currentResult === false ? 'alert-circle' : 'heart-outline'} size={26} color={isSavedResponse || currentResult === true ? palette.success : currentResult === false ? palette.danger : palette.primaryDark} />
        <View style={styles.feedbackCopy}><Text style={styles.feedbackTitle}>{isSavedResponse ? t('reflectionSaved') : summary}</Text>{!isSavedResponse ? <Text style={styles.feedbackText}>{explanation}</Text> : null}</View>
      </View>
      <ActionButton variant="secondary" accessibilityLabel={currentResult === false ? `${isChoiceReflection ? t('editReflection') : question.type === 'multiSelect' ? t('changeAnswers') : t('changeAnswer')} (${t('retry')})` : undefined} label={isChoiceReflection ? t('editReflection') : question.type === 'multiSelect' ? t('changeAnswers') : t('changeAnswer')} icon="arrow-right" iconPosition="trailing" onPress={() => { setEditing(true); onEditingChange?.(true); }} />
    </>}
  </View>;
}

const bold = { fontFamily: fontFamily.bodyBold, fontWeight: 'normal' as const };

const styles = StyleSheet.create({
  velaActivity: { gap: spacing.md },
  velaActivityInput: { minHeight: 132, borderWidth: 1, borderColor: palette.border, borderRadius: 16, padding: 13, color: palette.white, backgroundColor: palette.raised, fontFamily: fontFamily.body, fontSize: 16, lineHeight: 23 },
  stack: { gap: spacing.md },
  questionStack: { gap: 14 },
  choiceGroup: { gap: 10 },
  contentCard: { gap: 18, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: radius.xl, padding: 20, overflow: 'hidden' },
  lessonTitle: { ...typeScale.lesson, color: palette.ink },
  mediaBleed: { marginTop: -20, marginHorizontal: -20, padding: 12, backgroundColor: palette.white, borderBottomWidth: 1, borderBottomColor: palette.hairline },
  srOnly: { position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0 },
  body: { ...typeScale.body, color: palette.body },
  boldText: { ...bold, color: palette.ink },
  unorderedList: { gap: 10, paddingLeft: 2 },
  unorderedItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  unorderedBullet: { width: 8, height: 8, marginTop: 11, borderRadius: 4, overflow: 'hidden', backgroundColor: palette.dawn, color: 'transparent', fontSize: 1, lineHeight: 8 },
  unorderedText: { flex: 1, ...typeScale.body, color: palette.body },
  point: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pointText: { flex: 1, ...typeScale.body, fontSize: 17, lineHeight: 26, color: palette.body },
  summaryList: { gap: 10 },
  summaryRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start', borderWidth: 1, borderColor: palette.border, borderRadius: radius.lg, padding: 16, backgroundColor: palette.surface, overflow: 'hidden' },
  summaryCheck: { width: 26, height: 26, borderRadius: 13, marginTop: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.success },
  questionCueRow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: palette.primarySoft },
  questionCueReflection: { backgroundColor: palette.dawnSoft },
  questionCue: { ...typeScale.eyebrow, fontSize: 11.5, color: palette.primary },
  questionCueTextReflection: { color: palette.dawnInk },
  prompt: { ...typeScale.question, color: palette.ink },
  takeaway: { gap: 10, borderLeftWidth: 4, borderLeftColor: palette.dawn, backgroundColor: palette.surfaceSoft, borderRadius: radius.md, padding: spacing.md },
  takeawayHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  takeawayLabel: { ...typeScale.eyebrow, fontSize: 11.5, color: palette.dawnInk },
  orderedList: { gap: 12 },
  orderedItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  orderedNumber: { width: 28, height: 28, borderRadius: 14, marginTop: 1, overflow: 'hidden', textAlign: 'center', backgroundColor: palette.primarySoft, color: palette.primary, ...bold, fontSize: 14, lineHeight: 28 },
  orderedText: { flex: 1, ...typeScale.body, color: palette.body },
  sourceLinkButton: { minHeight: touchTarget, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  sourceLink: { color: palette.primary, textDecorationLine: 'underline', ...bold, fontSize: 15, lineHeight: 21 },
  choice: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderColor: palette.border, backgroundColor: palette.surface, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 13, overflow: 'hidden' },
  choiceActive: { borderColor: palette.primary, backgroundColor: palette.primarySoft },
  choiceCorrect: { borderColor: palette.success, backgroundColor: palette.successSoft },
  choiceIncorrect: { borderColor: palette.danger, backgroundColor: palette.dangerSoft },
  choiceMissed: { borderColor: palette.warning, borderStyle: 'dashed', backgroundColor: palette.warningSoft },
  choiceFocused: { outlineWidth: 3, outlineStyle: 'solid', outlineColor: palette.focus, outlineOffset: 2 } as object,
  choiceCopy: { flex: 1, gap: spacing.xs },
  choiceText: { color: palette.ink, fontFamily: fontFamily.body, fontWeight: 'normal', fontSize: 16.5, lineHeight: 23 },
  choiceTextActive: { color: palette.ink, ...bold },
  correctLabel: { color: palette.success, ...bold, fontSize: 14 },
  incorrectLabel: { color: palette.danger, ...bold, fontSize: 14 },
  missedLabel: { color: palette.warning, ...bold, fontSize: 14 },
  optionExplanation: { color: palette.body, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 21 },
  feedback: { flexDirection: 'row', gap: 12, backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.border, borderRadius: radius.lg, padding: 16 },
  feedbackCorrect: { backgroundColor: palette.successSoft, borderColor: 'rgba(43,110,76,0.35)' },
  feedbackIncorrect: { backgroundColor: palette.dangerSoft, borderColor: 'rgba(174,55,39,0.35)' },
  feedbackCopy: { flex: 1, gap: 6 },
  feedbackTitle: { color: palette.ink, fontFamily: fontFamily.heading, fontWeight: 'normal', fontSize: 19, lineHeight: 24 },
  feedbackText: { color: palette.body, fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24 },
  reflectionInstruction: { color: palette.body, fontFamily: fontFamily.body, fontSize: 15.5, lineHeight: 22 },
  reflectionPrivacy: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20 },
  reflectionStack: {},
  reflectionCard: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: radius.xl, padding: 20, gap: 12, overflow: 'hidden' },
  reflectionPrompt: { ...typeScale.question, fontSize: 20, lineHeight: 27, color: palette.ink },
  reflectionInput: { minHeight: 132, borderWidth: 1.5, borderColor: palette.borderStrong, borderRadius: radius.md, padding: 14, color: palette.ink, backgroundColor: palette.raised, fontFamily: fontFamily.body, fontSize: 17, lineHeight: 25 },
  reflectionPrivacyRow: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reflectionSaveError: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(174,55,39,0.35)', backgroundColor: palette.dangerSoft },
  reflectionSaveErrorText: { flex: 1, color: palette.danger, fontFamily: fontFamily.body, fontSize: 14.5, lineHeight: 20 },
  reflectionSavedCard: { gap: spacing.sm, borderWidth: 1, borderColor: 'rgba(43,110,76,0.35)', borderRadius: radius.lg, padding: spacing.md, backgroundColor: palette.successSoft },
  savedLocallyLabel: { color: palette.success, ...bold, fontSize: 12, lineHeight: 16, letterSpacing: 1 },
  savedLocallyBody: { color: palette.body, fontFamily: fontFamily.body, fontSize: 14.5, lineHeight: 20 },
  savedReflectionText: { minHeight: 110, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, padding: 13, backgroundColor: palette.raised },
  reflectionInputText: { color: palette.ink, fontFamily: fontFamily.body, fontSize: 17, lineHeight: 25 },
  reflectionChoicePanel: { gap: 10 },
  reflectionChoice: { borderRadius: radius.lg },
  reflectionChoiceActive: { backgroundColor: palette.reflectionSelected, borderColor: palette.dawnInk },
  feedbackSaved: { backgroundColor: palette.successSoft, borderColor: 'rgba(43,110,76,0.35)' },
  pressed: { opacity: 0.8 },
});
