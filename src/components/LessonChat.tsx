import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton, AppScreen, Header } from '@/src/components/ui';
import { useVelaNudgeSuppression, VelaMascot, type VelaVisualState } from '@/src/components/VelaMascot';
import { getModules } from '@/src/content';
import { callAi, createEphemeralSessionId, SafeAiError } from '@/src/services/ai-client';
import { containsLikelyIdentifier } from '@/src/services/privacy';
import { useApp, type LessonChatMessage } from '@/src/state/AppProvider';
import { fontFamily, palette, radius, spacing } from '@/src/theme/tokens';
import type { AiActivityKind } from '@/src/types/content';
import { buildRollingConversation, trimTranscriptForDisplay } from '@/shared/conversation-policy';

type ChatStatus = 'empty' | 'thinking' | 'error' | 'offline' | 'safety';

export default function LessonChat({ inlineActivityId, inlineKind, inline, sheet = false, onClose }: { inlineActivityId?: string; inlineKind?: AiActivityKind; inline?: boolean; sheet?: boolean; onClose?: () => void } = {}) {
  const params = useLocalSearchParams<{ activityId?: string; kind?: AiActivityKind; returnTo?: string }>();
  const { state, setAiConsent, pendingVelaActivity, setPendingVelaActivity } = useApp();
  const { t } = useTranslation();
  const screen = useMemo(() => getModules(state.language).flatMap(m => m.screens).find(s => s.id === params.activityId || (s.type === 'aiActivity' && s.activityId === params.activityId)), [params.activityId, state.language]);
  const requestedId = inlineActivityId ?? params.activityId;
  const activeScreen = inlineActivityId ? getModules(state.language).flatMap(m => m.screens).find(s => s.id === inlineActivityId || (s.type === 'aiActivity' && s.activityId === inlineActivityId)) : screen;
  const lessonId = activeScreen?.id ?? requestedId ?? 'm1-01';
  const activeModuleId = requestedId ? getModules(state.language).find((module) => module.screens.some((candidate) => candidate.id === lessonId))?.id : undefined;
  const activeModule = useMemo(() => getModules(state.language).find((module) => module.id === activeModuleId), [activeModuleId, state.language]);
  const activityId = activeScreen?.type === 'aiActivity' ? activeScreen.activityId : requestedId;
  const kind = inlineKind ?? params.kind ?? (activeScreen?.type === 'aiActivity' ? activeScreen.activityKind : 'lesson-question');
  const pendingMatches = Boolean(pendingVelaActivity && (pendingVelaActivity.activityId === requestedId || pendingVelaActivity.activityId === activeScreen?.id));
  const [messages, setMessages] = useState<LessonChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [consent, setConsent] = useState(state.aiConsent);
  const [consentChecked, setConsentChecked] = useState(state.aiConsent);
  const [status, setStatus] = useState<ChatStatus>('empty');
  const [error, setError] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const threadRef = useRef<ScrollView>(null);
  const shouldFollowLatest = useRef(true);
  const sessionId = useRef(createEphemeralSessionId());
  const conversationToken = useRef<string | null>(null);
  const sending = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const lastAttempt = useRef('');
  const closeRef = useRef<() => void>(() => undefined);
  const insets = useSafeAreaInsets();

  useVelaNudgeSuppression('lesson-chat', Boolean(sheet || inline || error || !consent));

  useEffect(() => { setConsent(state.aiConsent); setConsentChecked(state.aiConsent); }, [state.aiConsent]);
  useEffect(() => {
    setMessages([]); setInput(''); setError(''); setStatus('empty'); conversationToken.current = null; sessionId.current = createEphemeralSessionId();
  }, [state.velaConversationRevision]);
  useEffect(() => {
    if (pendingMatches && pendingVelaActivity?.text && !messages.length) setInput(pendingVelaActivity.text);
  }, [messages.length, pendingMatches, pendingVelaActivity?.text]);
  useEffect(() => {
    if (!shouldFollowLatest.current) return;
    requestAnimationFrame(() => threadRef.current?.scrollToEnd({ animated: true }));
  }, [messages, status]);

  const send = async (retryText?: string) => {
    const text = (retryText ?? input).trim();
    if (!text || sending.current || status === 'thinking') return;
    if (!state.aiEnabled) { setStatus('error'); setError(t('aiDisabled')); return; }
    if (!consent || !state.aiConsent) return;
    if (containsLikelyIdentifier(text)) { setStatus('error'); setError(t('chatPrivacyWarning')); return; }
    sending.current = true;
    lastAttempt.current = text;
    const previousMessages = messages;
    const next = trimTranscriptForDisplay([...messages, { role: 'user' as const, content: text }]);
    const requestMessages = buildRollingConversation(next);
    const controller = new AbortController();
    abortRef.current = controller;
    setMessages(next); setInput(''); setStatus('thinking'); setError('');
    try {
      if (!conversationToken.current) {
        const started = await callAi<{ conversationToken?: string }>('conversation-start', { activityId, lessonId, locale: state.language, sessionId: sessionId.current }, consent, 12_000, controller.signal);
        if (!started.conversationToken) throw new SafeAiError('AI_UNAVAILABLE', 'Conversation authorization is unavailable.', true);
        conversationToken.current = started.conversationToken;
      }
      const result = await callAi<{ message?: string; feedback?: string; followUpQuestion?: string; conversationToken?: string }>('lesson-chat', { activityId, lessonId, kind, locale: state.language, sessionId: sessionId.current, conversationToken: conversationToken.current, messages: requestMessages }, consent, 12_000, controller.signal);
      if (!result.conversationToken) throw new SafeAiError('AI_UNAVAILABLE', 'Conversation authorization is unavailable.', true);
      conversationToken.current = result.conversationToken;
      const raw = result.message ?? result.feedback ?? '';
      const assistant = [raw, result.followUpQuestion].filter(Boolean).join('\n\n');
      setMessages(trimTranscriptForDisplay([...next, { role: 'assistant' as const, content: assistant }]));
      if (pendingMatches) setPendingVelaActivity(undefined);
      setStatus('empty');
    } catch (e) {
      setMessages(previousMessages);
      setInput(text);
      if (controller.signal.aborted) {
        setError('');
        setStatus('empty');
        return;
      }
      if (e instanceof SafeAiError && e.code === 'INVALID_REQUEST') conversationToken.current = null;
      if (e instanceof SafeAiError && e.code === 'OUTSIDE_SCOPE') { setStatus('safety'); setError(t('velaSafety')); }
      else if (e instanceof SafeAiError && (e.code === 'RATE_LIMITED' || e.code === 'UPSTREAM_RATE_LIMITED')) { setStatus('error'); setError(t('velaRateLimited')); }
      else if (e instanceof SafeAiError && e.code === 'AI_UNAVAILABLE') { setStatus('offline'); setError(t('velaOffline')); }
      else if (e instanceof SafeAiError && e.code === 'CONSENT_REQUIRED') { setStatus('error'); setError(t('velaConsentTitle')); }
      else { setStatus('error'); setError(t('chatUnavailable')); }
    } finally {
      abortRef.current = null;
      setStatus((current) => current === 'thinking' ? 'empty' : current);
      sending.current = false;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    sending.current = false;
    setStatus('empty');
    setInput(lastAttempt.current);
  };

  const returnTo = typeof params.returnTo === 'string' && (
    params.returnTo === '/' ||
    params.returnTo === '/settings' ||
    /^\/module\/[^/]+$/.test(params.returnTo) ||
    /^\/module\/[^/]+\/complete$/.test(params.returnTo) ||
    /^\/lesson\/[^/]+\/[^/]+$/.test(params.returnTo)
  ) ? params.returnTo : undefined;
  const close = () => {
    if (onClose) onClose();
    else if (returnTo) router.replace(returnTo as Href);
    else if (activeModuleId) router.replace(`/lesson/${activeModuleId}/${lessonId}` as Href);
    else router.replace('/' as Href);
  };
  closeRef.current = close;

  useEffect(() => {
    if (!sheet && !inline) return;
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (keyboardVisible) { Keyboard.dismiss(); setKeyboardVisible(false); return true; }
      closeRef.current();
      return true;
    });
    return () => { show.remove(); hide.remove(); back.remove(); };
  }, [inline, keyboardVisible, sheet]);

  const clear = () => {
    setMessages([]);
    setInput('');
    setError('');
    setStatus('empty');
    conversationToken.current = null;
  };

  const visualState: VelaVisualState = status === 'thinking' ? 'thinking' : status === 'offline' ? 'offline' : status === 'safety' ? 'safety' : status === 'error' ? 'error' : 'idle';
  const body = <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} keyboardVerticalOffset={insets.top}>
    <View testID="vela-sheet-header" style={styles.sheetHeader}><View style={styles.sheetTitle}><VelaMascot size={44} state={visualState} /><View style={styles.headerCopy}><Text accessibilityRole="header" style={styles.title}>{t('velaName')}</Text><Text style={styles.guide}>{t('velaGuide')}</Text>{activeModule ? <Text style={styles.context}>{activeModule.shortTitle}</Text> : null}</View></View><Pressable accessibilityRole="button" accessibilityLabel={t('closeVela')} onPress={close} style={styles.close}><MaterialCommunityIcons name="close" size={22} color={palette.inkMuted} /></Pressable></View>
    {!consent ? <ScrollView style={styles.thread} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"><View style={styles.consentSurface}><Text style={styles.consentTitle}>{t('velaConsentTitle')}</Text><Text style={styles.consentText}>{t('velaConsentBody')}</Text><Text style={styles.consentText}>{t('velaConsentData')}</Text><Pressable accessibilityRole="checkbox" accessibilityLabel={t('chatConsent')} accessibilityState={{ checked: consentChecked }} onPress={() => setConsentChecked((checked) => !checked)} style={styles.consentCheck}><MaterialCommunityIcons name={consentChecked ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={consentChecked ? palette.accent : palette.inkMuted} /><Text style={styles.consentCheckText}>{t('chatConsent')}</Text></Pressable><ActionButton label={t('continue')} icon="shield-check-outline" disabled={!state.aiEnabled || !consentChecked} onPress={() => { if (!consentChecked) return; setConsent(true); setAiConsent(true); }} />{!state.aiEnabled ? <Text style={styles.muted}>{t('velaConsentDisabled')}</Text> : null}</View></ScrollView> : <>
      <ScrollView ref={threadRef} testID="lesson-chat-thread" style={styles.thread} contentContainerStyle={styles.content} accessibilityLabel={state.language === 'es' ? 'Historial de conversación' : 'Conversation history'} accessibilityLiveRegion="polite" keyboardShouldPersistTaps="handled" scrollEventThrottle={16} onScroll={(event) => { const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent; shouldFollowLatest.current = contentSize.height - (contentOffset.y + layoutMeasurement.height) < 48; }}>
        {!messages.length && status === 'empty' ? <View style={styles.empty}><VelaMascot state="idle" size={64} /><Text style={styles.emptyText}>{t('velaEmpty')}</Text></View> : null}
        {messages.map((m, i) => <View key={`${i}-${m.role}`} testID={m.role === 'assistant' ? 'lesson-chat-assistant-message' : 'lesson-chat-user-message'} accessibilityRole="text" style={[styles.bubble, m.role === 'user' ? styles.user : styles.assistant]}><Text style={styles.role}>{m.role === 'user' ? t('you') : t('chatTutor')}</Text><Text testID={m.role === 'assistant' ? 'lesson-chat-assistant-content' : 'lesson-chat-user-content'} style={styles.message}>{m.content}</Text></View>)}
        {status === 'thinking' ? <View accessibilityLiveRegion="polite" style={styles.thinking}><VelaMascot state="thinking" size={32} /><Text style={styles.muted}>{t('velaThinking')}</Text><ActionButton compact variant="secondary" icon="stop" accessibilityLabel={t('velaStop')} label={t('velaStop')} onPress={stop} /></View> : null}
        {error ? <View accessibilityRole="alert" style={[styles.errorSurface, status === 'safety' && styles.safetySurface]}><MaterialCommunityIcons name={status === 'safety' ? 'shield-alert-outline' : 'alert-circle-outline'} size={20} color={status === 'safety' ? palette.accent : palette.danger} /><Text style={styles.error}>{error}</Text>{status === 'error' || status === 'offline' ? <ActionButton compact variant="secondary" icon="reload" accessibilityLabel={t('velaRetry')} label={t('velaRetry')} onPress={() => void send(lastAttempt.current)} /> : null}</View> : null}
      </ScrollView>
      <View testID="lesson-chat-composer" style={styles.composer}><View style={styles.composerTop}><Text style={styles.composerLabel}>{t('yourResponse')}</Text>{messages.length ? <Pressable accessibilityRole="button" accessibilityLabel={t('clearTranscript')} onPress={clear}><Text style={styles.clear}>{t('clearTranscript')}</Text></Pressable> : null}</View><Text style={styles.privacyNotice}>{t('chatPrivacyNotice')}</Text><View style={styles.composerRow}><TextInput accessibilityLabel={t('chatPlaceholder')} placeholder={t('chatPlaceholder')} placeholderTextColor={palette.inkMuted} value={input} onChangeText={setInput} editable={consent && status !== 'thinking' && state.aiEnabled} maxLength={1200} onFocus={() => { setInputFocused(true); requestAnimationFrame(() => { threadRef.current?.scrollToEnd({ animated: true }); setTimeout(() => threadRef.current?.scrollToEnd({ animated: true }), 140); }); }} onBlur={() => setInputFocused(false)} style={[styles.input, inputFocused && styles.inputFocused]} multiline /><ActionButton compact icon="send" accessibilityLabel={t('chatSend')} label={t('chatSend')} onPress={() => void send()} disabled={!input.trim() || status === 'thinking' || !consent || !state.aiEnabled} /></View></View>
    </>}
    {activeScreen && !sheet ? <ActionButton variant="secondary" label={t('chatContinue')} onPress={close} /> : null}
  </KeyboardAvoidingView>;

  if (inline) return <View style={styles.inlineSheet}>{body}</View>;
  if (sheet) return <View style={styles.routeOverlay}><View style={[styles.routeSheet, { paddingBottom: Math.max(34, insets.bottom) }]}>{body}</View></View>;
  return <AppScreen scroll={false}><Header title={screen?.type === 'aiActivity' ? screen.title : t('askLesson')} />{body}</AppScreen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1, minHeight: 0 },
  inlineSheet: { minHeight: 520, maxHeight: 720, backgroundColor: palette.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: palette.border, overflow: 'hidden' },
  routeOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(14,17,23,0.42)' },
  routeSheet: { height: '82%', minHeight: 560, maxHeight: 720, overflow: 'hidden', backgroundColor: palette.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, borderColor: palette.border },
  sheetHeader: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.border },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  sheetTitle: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerCopy: { flex: 1, gap: 2 },
  title: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 18, fontWeight: '800' },
  guide: { color: palette.body, fontFamily: fontFamily.body, fontSize: 12, lineHeight: 17 },
  context: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 11, lineHeight: 15 },
  thread: { flex: 1, minHeight: 220 },
  content: { gap: spacing.sm, padding: spacing.md, paddingBottom: spacing.xl },
  empty: { flex: 1, minHeight: 250, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  emptyText: { maxWidth: 280, color: palette.body, fontFamily: fontFamily.body, textAlign: 'center', fontSize: 17, lineHeight: 26 },
  consentSurface: { gap: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: palette.accent, borderRadius: radius.lg, backgroundColor: palette.accentSoft },
  consentTitle: { color: palette.ink, fontSize: 20, lineHeight: 28, fontWeight: '800' },
  consentText: { color: palette.body, fontFamily: fontFamily.body, fontSize: 15, lineHeight: 23 },
  consentCheck: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  consentCheckText: { flex: 1, color: palette.ink, fontSize: 15, lineHeight: 22, fontWeight: '700' },
  bubble: { padding: spacing.md, borderRadius: radius.md, maxWidth: '90%', borderWidth: 1 },
  user: { alignSelf: 'flex-end', backgroundColor: palette.primarySoft, borderColor: palette.primary },
  assistant: { alignSelf: 'flex-start', backgroundColor: palette.surfaceSoft, borderColor: palette.border },
  role: { color: palette.inkMuted, fontSize: 12, fontWeight: '900', letterSpacing: 0.3, marginBottom: 4 },
  message: { color: palette.body, fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24 },
  thinking: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  muted: { flex: 1, color: palette.inkMuted, fontSize: 14, lineHeight: 21 },
  errorSurface: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: palette.dangerSoft },
  safetySurface: { backgroundColor: palette.accentSoft },
  error: { flex: 1, color: palette.danger, fontSize: 14, lineHeight: 21 },
  composer: { gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: palette.raised },
  composerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  composerLabel: { color: palette.ink, fontSize: 14, fontWeight: '800' },
  clear: { color: palette.accent, fontSize: 13, fontWeight: '800' },
  composerRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  privacyNotice: { color: palette.inkMuted, fontSize: 12, lineHeight: 17 },
  input: { flex: 1, minHeight: 48, maxHeight: 128, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, color: palette.ink, backgroundColor: palette.background, fontFamily: fontFamily.body },
  inputFocused: { borderColor: palette.focus, outlineWidth: 2, outlineColor: palette.focus, outlineOffset: 1 },
});
