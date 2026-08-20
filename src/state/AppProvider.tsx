import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import i18n from '@/src/i18n';
import type { SupportedLocale } from '@/src/types/content';
import { CURRICULUM_VERSION, migrateLearningState } from './curriculum-migration';

const STORAGE_KEY = 'sleep_education_state_v3';
const LEGACY_STORAGE_KEY = 'sleep_education_state_v2';

export interface AnswerAttempt {
  answers: string[];
  correct?: boolean;
  submittedAt: string;
}

export interface SavedActionPlan {
  id: string;
  text: string;
  createdAt: string;
}
export interface SavedReflection { text: string; savedAt: string }
export interface LessonChatMessage { role: 'user' | 'assistant'; content: string }
export type ConversationState = 'awaiting_first_message' | 'awaiting_ai' | 'open' | 'error';
export interface LessonChatState { messages: LessonChatMessage[]; status?: ConversationState }
export interface PendingVelaActivity { activityId: string; text: string }

export interface LearningState {
  curriculumVersion: number;
  completedScreenIds: string[];
  completedModuleIds: string[];
  currentModuleId?: string;
  lastScreenByModule: Record<string, string>;
  answers: Record<string, string[]>;
  answerAttempts: Record<string, AnswerAttempt[]>;
  reflectionDrafts: Record<string, string>;
  savedReflections: Record<string, SavedReflection>;
  language: SupportedLocale;
  narrationEnabled: boolean;
  narrationRate: number;
  narrationPitch: number;
  voiceByLocale: Partial<Record<SupportedLocale, string>>;
  reduceMotion: boolean;
  aiConsent: boolean;
  aiEnabled: boolean;
  velaConversationRevision: number;
  actionPlans: SavedActionPlan[];
}

const defaults: LearningState = {
  curriculumVersion: CURRICULUM_VERSION,
  completedScreenIds: [], completedModuleIds: [], lastScreenByModule: {}, answers: {}, answerAttempts: {}, reflectionDrafts: {}, savedReflections: {},
  language: 'en', narrationEnabled: false, narrationRate: 0.95, narrationPitch: 1, voiceByLocale: {},
  reduceMotion: false,
  aiConsent: false, aiEnabled: true, velaConversationRevision: 0, actionPlans: [],
};

interface AppContextValue {
  state: LearningState;
  loaded: boolean;
  completeScreen: (screenId: string, moduleId: string, nextScreenId?: string, isLast?: boolean) => void;
  saveAnswer: (screenId: string, answers: string[]) => void;
  submitAnswer: (screenId: string, answers: string[], correct?: boolean) => void;
  saveReflectionDraft: (screenId: string, text: string) => void;
  saveReflection: (screenId: string, text: string) => Promise<void>;
  setLanguage: (language: SupportedLocale) => void;
  setNarrationEnabled: (enabled: boolean) => void;
  setNarrationRate: (rate: number) => void;
  setNarrationPitch: (pitch: number) => void;
  setVoice: (locale: SupportedLocale, voice?: string) => void;
  setReduceMotion: (enabled: boolean) => void;
  setAiConsent: (consent: boolean) => void;
  setAiEnabled: (enabled: boolean) => void;
  saveActionPlan: (plan: SavedActionPlan) => void;
  deleteActionPlan: (id: string) => void;
  pendingVelaActivity?: PendingVelaActivity;
  setPendingVelaActivity: (activity?: PendingVelaActivity) => void;
  clearVelaConversation: () => void;
  saveNow: () => Promise<void>;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: React.PropsWithChildren) {
  const [state, setState] = useState(defaults);
  const [loaded, setLoaded] = useState(false);
  const [pendingVelaActivity, setPendingVelaActivity] = useState<PendingVelaActivity | undefined>();

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(LEGACY_STORAGE_KEY)])
      .then(([current, legacy]) => current ?? legacy)
      .then((value) => {
        if (value) {
          const parsed = migrateLearningState(JSON.parse(value) as Partial<LearningState>);
          setState({
            ...defaults,
            curriculumVersion: parsed.curriculumVersion ?? defaults.curriculumVersion,
            completedScreenIds: parsed.completedScreenIds ?? [],
            completedModuleIds: parsed.completedModuleIds ?? [],
            currentModuleId: parsed.currentModuleId,
            lastScreenByModule: parsed.lastScreenByModule ?? {},
            answers: parsed.answers ?? {},
            answerAttempts: parsed.answerAttempts ?? {},
            reflectionDrafts: parsed.reflectionDrafts ?? {},
            savedReflections: parsed.savedReflections ?? {},
            language: parsed.language ?? defaults.language,
            narrationEnabled: parsed.narrationEnabled ?? defaults.narrationEnabled,
            narrationRate: parsed.narrationRate ?? defaults.narrationRate,
            narrationPitch: parsed.narrationPitch ?? defaults.narrationPitch,
            voiceByLocale: parsed.voiceByLocale ?? {},
            reduceMotion: parsed.reduceMotion ?? defaults.reduceMotion,
            aiConsent: parsed.aiConsent ?? false,
            aiEnabled: parsed.aiEnabled ?? true,
            velaConversationRevision: parsed.velaConversationRevision ?? 0,
            actionPlans: parsed.actionPlans ?? [],
          });
          void AsyncStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    void i18n.changeLanguage(state.language);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [loaded, state]);

  const completeScreen = useCallback((screenId: string, moduleId: string, nextScreenId?: string, isLast?: boolean) => {
    setState((current) => ({
      ...current,
      completedScreenIds: current.completedScreenIds.includes(screenId)
        ? current.completedScreenIds : [...current.completedScreenIds, screenId],
      completedModuleIds: isLast && !current.completedModuleIds.includes(moduleId)
        ? [...current.completedModuleIds, moduleId] : current.completedModuleIds,
      currentModuleId: moduleId,
      lastScreenByModule: { ...current.lastScreenByModule, [moduleId]: nextScreenId ?? screenId },
    }));
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    state, loaded, completeScreen,
    saveAnswer: (screenId, answers) => setState((current) => ({ ...current, answers: { ...current.answers, [screenId]: answers } })),
    saveReflectionDraft: (screenId, text) => setState((current) => ({ ...current, reflectionDrafts: { ...current.reflectionDrafts, [screenId]: text } })),
    saveReflection: async (screenId, text) => {
      let next = state;
      setState((current) => {
        next = {
          ...current,
          reflectionDrafts: { ...current.reflectionDrafts, [screenId]: text },
          savedReflections: { ...current.savedReflections, [screenId]: { text, savedAt: new Date().toISOString() } },
        };
        return next;
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    submitAnswer: (screenId, answers, correct) => setState((current) => ({
      ...current,
      answers: { ...current.answers, [screenId]: answers },
      answerAttempts: {
        ...current.answerAttempts,
        [screenId]: [...(current.answerAttempts[screenId] ?? []), { answers, correct, submittedAt: new Date().toISOString() }],
      },
    })),
    setLanguage: (language) => setState((current) => {
      const next = { ...current, language };
      // Persist the mode at the point of selection so immediate navigation or
      // reload cannot recreate the prior locale before the effect flushes.
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      void i18n.changeLanguage(language);
      return next;
    }),
    setNarrationEnabled: (narrationEnabled) => setState((current) => ({ ...current, narrationEnabled })),
    setNarrationRate: (narrationRate) => setState((current) => ({ ...current, narrationRate })),
    setNarrationPitch: (narrationPitch) => setState((current) => ({ ...current, narrationPitch })),
    setVoice: (locale, voice) => setState((current) => ({ ...current, voiceByLocale: { ...current.voiceByLocale, [locale]: voice } })),
    setReduceMotion: (reduceMotion) => setState((current) => ({ ...current, reduceMotion })),
    setAiConsent: (aiConsent) => setState((current) => ({ ...current, aiConsent })),
    setAiEnabled: (aiEnabled) => setState((current) => ({ ...current, aiEnabled, aiConsent: aiEnabled ? current.aiConsent : false })),
    clearVelaConversation: () => setState((current) => ({ ...current, velaConversationRevision: current.velaConversationRevision + 1 })),
    saveActionPlan: (plan) => setState((current) => ({ ...current, actionPlans: [...current.actionPlans, plan] })),
    deleteActionPlan: (id) => setState((current) => ({ ...current, actionPlans: current.actionPlans.filter((plan) => plan.id !== id) })),
    pendingVelaActivity,
    setPendingVelaActivity,
    saveNow: () => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)),
    resetProgress: () => setState((current) => ({
      ...defaults,
      language: current.language,
      narrationEnabled: current.narrationEnabled,
      narrationRate: current.narrationRate,
      narrationPitch: current.narrationPitch,
      voiceByLocale: current.voiceByLocale,
       aiConsent: false,
       aiEnabled: current.aiEnabled,
    })),
  }), [completeScreen, loaded, pendingVelaActivity, state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
};
