import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionButton, AppScreen, Card, Header } from '@/src/components/ui';
import { deviceSpeechNarrationProvider, getVoiceInventory, type VoiceInventoryItem } from '@/src/services/narration';
import { useApp } from '@/src/state/AppProvider';
import { palette, radius, spacing, touchTarget } from '@/src/theme/tokens';
import type { SupportedLocale } from '@/src/types/content';

const samples = {
  en: 'Welcome to Sleep Education. This sample helps you compare narration voices.',
  es: 'Bienvenido a Educación sobre el Sueño. Esta muestra le ayuda a comparar las voces de narración.',
} as const;
type Filter = 'all' | SupportedLocale;

export default function VoiceLabScreen() {
  const { state, setVoice } = useApp();
  const [voices, setVoices] = useState<VoiceInventoryItem[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setVoices(await getVoiceInventory()); } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); return () => { void deviceSpeechNarrationProvider.stop(); }; }, [refresh]);
  const filtered = useMemo(() => filter === 'all' ? voices : voices.filter((voice) => voice.language.toLowerCase().startsWith(filter)), [filter, voices]);
  const inventoryText = JSON.stringify({ generatedAt: new Date().toISOString(), voices }, null, 2);
  const exportInventory = async () => {
    const path = `${FileSystem.cacheDirectory}sleep-education-voice-inventory.json`;
    await FileSystem.writeAsStringAsync(path, inventoryText);
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path, { mimeType: 'application/json' });
    else Alert.alert('Inventory saved', path);
  };
  const preview = async (voice: VoiceInventoryItem) => {
    const locale: SupportedLocale = voice.language.toLowerCase().startsWith('es') ? 'es' : 'en';
    await deviceSpeechNarrationProvider.play({ text: samples[locale], locale, voice: voice.identifier, rate: state.narrationRate, pitch: state.narrationPitch });
  };

  return <AppScreen>
    <Pressable accessibilityRole="button" accessibilityLabel="Back to Settings" onPress={() => { void deviceSpeechNarrationProvider.stop(); router.back(); }} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={24} color={palette.primaryDark} /><Text style={styles.backText}>Settings</Text></Pressable>
    <Header eyebrow="Development tool" title="Voice Lab" subtitle="Every narration voice reported by this device or browser. Availability differs by platform." />
    <View style={styles.filters}>{(['all', 'en', 'es'] as const).map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ selected: filter === value }} onPress={() => setFilter(value)} style={[styles.filter, filter === value && styles.filterActive]}><Text style={[styles.filterText, filter === value && styles.filterTextActive]}>{value === 'all' ? 'All voices' : value === 'en' ? 'English' : 'Spanish'}</Text></Pressable>)}</View>
    <View style={styles.actions}><ActionButton variant="secondary" label="Refresh" icon="refresh" onPress={() => void refresh()} /><ActionButton variant="secondary" label="Copy inventory" icon="content-copy" onPress={() => void Clipboard.setStringAsync(inventoryText)} /><ActionButton variant="secondary" label="Export JSON" icon="export" onPress={() => void exportInventory()} /></View>
    <Text style={styles.count}>{loading ? 'Loading voices…' : `${filtered.length} of ${voices.length} voices`}</Text>
    {filtered.map((voice) => {
      const locale: SupportedLocale | undefined = voice.language.toLowerCase().startsWith('en') ? 'en' : voice.language.toLowerCase().startsWith('es') ? 'es' : undefined;
      const selected = locale ? state.voiceByLocale[locale] === voice.identifier : false;
      return <Card key={voice.identifier}>
        <View style={styles.voiceTitle}><View style={styles.voiceCopy}><Text style={styles.name}>{voice.name}</Text><Text selectable style={styles.identifier}>{voice.identifier}</Text></View>{selected ? <MaterialCommunityIcons name="check-circle" size={24} color={palette.success} /> : null}</View>
        <Text style={styles.meta}>{voice.language} · {voice.quality}{voice.isEnhanced ? ' · enhanced' : ''}{voice.isDefault ? ' · default' : ''}{voice.isLocal ? ' · local' : ''} · {voice.platform}</Text>
        <View style={styles.actions}><ActionButton variant="secondary" label="Preview" icon="play" disabled={!locale} onPress={() => void preview(voice)} />{locale ? <ActionButton label={`Use for ${locale === 'en' ? 'English' : 'Spanish'}`} icon="check" onPress={() => setVoice(locale, voice.identifier)} /> : null}</View>
      </Card>;
    })}
    {!loading && filtered.length === 0 ? <Card><Text style={styles.empty}>{filter === 'es' ? 'No Spanish voice is installed or exposed by this platform. Install a Spanish system voice, refresh, and try again.' : 'No matching voices were reported.'}</Text></Card> : null}
  </AppScreen>;
}

const styles = StyleSheet.create({
  back: { minHeight: touchTarget, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.sm },
  backText: { color: palette.primaryDark, fontWeight: '800' }, filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: { minHeight: touchTarget, justifyContent: 'center', paddingHorizontal: spacing.md, borderRadius: radius.pill, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.surface },
  filterActive: { borderColor: palette.primaryDark, backgroundColor: palette.primarySoft }, filterText: { color: palette.inkMuted, fontWeight: '700' }, filterTextActive: { color: palette.primaryDark, fontWeight: '900' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, count: { color: palette.inkMuted, fontWeight: '700' },
  voiceTitle: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }, voiceCopy: { flex: 1, gap: spacing.xs },
  name: { color: palette.ink, fontSize: 18, fontWeight: '900' }, identifier: { color: palette.inkMuted, fontSize: 12, lineHeight: 18 },
  meta: { color: palette.inkMuted, fontSize: 14, lineHeight: 21 }, empty: { color: palette.ink, fontSize: 16, lineHeight: 24 },
});
