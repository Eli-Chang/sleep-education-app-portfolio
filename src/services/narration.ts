import * as Speech from 'expo-speech';
import type { Voice } from 'expo-speech';
import type { LessonScreen, SupportedLocale } from '@/src/types/content';

export interface NarrationRequest {
  text: string;
  locale: SupportedLocale;
  voice?: string;
  rate?: number;
  pitch?: number;
}

export interface NarrationProvider {
  play(request: NarrationRequest): Promise<void>;
  stop(): Promise<void>;
  replay(): Promise<void>;
  isAvailable(locale: string): Promise<boolean>;
}

export interface VoiceInventoryItem {
  identifier: string;
  name: string;
  language: string;
  quality: string;
  platform: string;
  isEnhanced: boolean;
  isDefault?: boolean;
  isLocal?: boolean;
}

const localePrefix = (locale: SupportedLocale) => locale === 'es' ? 'es' : 'en';
const isCompatible = (voice: Voice, locale: SupportedLocale) =>
  voice.language.toLowerCase().startsWith(localePrefix(locale));
const qualityScore = (voice: Voice) => {
  const quality = String(voice.quality ?? '').toLowerCase();
  const name = `${voice.name} ${voice.identifier}`.toLowerCase();
  return quality.includes('enhanced') || name.includes('enhanced') || name.includes('premium') ? 2
    : quality.includes('default') ? 1 : 0;
};

export const getVoiceInventory = async (): Promise<VoiceInventoryItem[]> =>
  (await Speech.getAvailableVoicesAsync()).map((voice) => ({
    identifier: voice.identifier,
    name: voice.name,
    language: voice.language,
    quality: String(voice.quality ?? 'unknown'),
    platform: voice.identifier.includes('.') ? voice.identifier.split('.')[0] : 'device',
    isEnhanced: qualityScore(voice) === 2,
    isDefault: (voice as Voice & { isDefault?: boolean }).isDefault,
    isLocal: (voice as Voice & { isLocalService?: boolean }).isLocalService,
  })).sort((a, b) => a.language.localeCompare(b.language) || a.name.localeCompare(b.name));

export async function chooseVoice(locale: SupportedLocale, selected?: string) {
  const voices = await Speech.getAvailableVoicesAsync();
  const compatible = voices.filter((voice) => isCompatible(voice, locale));
  const saved = compatible.find((voice) => voice.identifier === selected);
  if (saved) return saved.identifier;
  const preferredLocale = locale === 'es' ? 'es-us' : 'en-us';
  return [...compatible].sort((left, right) => {
    const localeDelta = Number(right.language.toLowerCase() === preferredLocale) - Number(left.language.toLowerCase() === preferredLocale);
    return localeDelta || qualityScore(right) - qualityScore(left) || left.name.localeCompare(right.name);
  })[0]?.identifier;
}

const splitNarration = (text: string, max = 700) => {
  const paragraphs = text.split(/\n{2,}/).map((value) => value.trim()).filter(Boolean);
  const sections = paragraphs.length ? paragraphs : [text];
  return sections.flatMap((section) => {
    const sentences = section.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [section];
    return sentences.reduce<string[]>((result, sentence) => {
      const last = result[result.length - 1];
      if (last && `${last} ${sentence}`.length <= max) result[result.length - 1] = `${last} ${sentence}`.trim();
      else result.push(sentence.trim());
      return result;
    }, []);
  });
};

export class DeviceSpeechNarrationProvider implements NarrationProvider {
  private lastRequest?: NarrationRequest;

  async play(request: NarrationRequest) {
    await Speech.stop();
    const voice = await chooseVoice(request.locale, request.voice);
    if (!voice) throw new Error(`NO_${request.locale.toUpperCase()}_VOICE`);
    this.lastRequest = { ...request, voice };
    const language = request.locale === 'es' ? 'es-US' : 'en-US';
    for (const text of splitNarration(request.text)) {
      Speech.speak(text, {
        language,
        voice,
        rate: request.rate ?? 0.95,
        pitch: request.pitch ?? 1,
      });
    }
  }

  stop() {
    return Speech.stop();
  }

  async replay() {
    if (this.lastRequest) await this.play(this.lastRequest);
  }

  async isAvailable(locale: string) {
    const supported = locale.toLowerCase().startsWith('es') ? 'es' : 'en';
    return Boolean(await chooseVoice(supported));
  }
}

export const deviceSpeechNarrationProvider = new DeviceSpeechNarrationProvider();

export const narrationText = (screen: LessonScreen) => {
  if (screen.narrationText) return screen.narrationText;
  if (screen.type === 'content') return [screen.title, ...screen.paragraphs, ...(screen.keyPoints ?? [])].join('. ');
  if (screen.type === 'summary') return [screen.title, ...screen.keyPoints].join('. ');
  if (screen.type === 'reflection') return [screen.title, screen.prompt].join('. ');
  if (screen.type === 'aiActivity') return [screen.title, screen.prompt].join('. ');
  if (screen.type === 'scenario') return [screen.title, screen.scenario, screen.prompt, ...screen.choices.map((choice) => choice.label)].join('. ');
  return [screen.title, screen.prompt, ...screen.choices.map((choice) => choice.label)].join('. ');
};

export async function speakScreen(screen: LessonScreen, locale: SupportedLocale, rate: number, selected?: string, pitch = 1) {
  const voice = await chooseVoice(locale, selected);
  if (!voice) return undefined;
  await deviceSpeechNarrationProvider.play({ text: narrationText(screen), locale, rate, voice, pitch });
  return voice;
}

export async function speakFeedback(text: string, locale: SupportedLocale, rate: number, selected?: string, pitch = 1) {
  const voice = await chooseVoice(locale, selected);
  if (!voice) return undefined;
  await deviceSpeechNarrationProvider.play({ text, locale, rate, voice, pitch });
  return voice;
}

export const stopNarration = () => deviceSpeechNarrationProvider.stop();
export const replayNarration = () => deviceSpeechNarrationProvider.replay();
export const isNarrationSpeaking = () => Speech.isSpeakingAsync().catch(() => false);
