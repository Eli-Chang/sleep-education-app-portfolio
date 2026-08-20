import { router, type Href } from 'expo-router';
import React from 'react';
import { LessonRenderer } from '@/src/components/LessonRenderer';
import { ActionButton, AppScreen, ProgressMeter } from '@/src/components/ui';
import { useApp } from '@/src/state/AppProvider';
import type { ReflectionLesson } from '@/src/types/content';
import { useTranslation } from 'react-i18next';
import { palette } from '@/src/theme/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

// Development-only parity surface for the Figma reflection contract. It is not
// part of the production curriculum registry and therefore cannot change its
// IDs, ordering, or bilingual content counts.
const preview: ReflectionLesson = {
  id: 'qa-reflection-preview',
  type: 'reflection',
  title: 'Think about your own experience',
  prompt: 'What is one question you still have about sleep apnea or PAP after this section?',
  placeholder: 'How will I know whether PAP is helping my sleep?',
  optional: true,
  sourceScreenshotIds: ['3:118'],
  sourceIds: ['figma-nocturnal-vela'],
};

export default function ReflectionPreview() {
  const { t } = useTranslation();
  const { state } = useApp();
  const screen = state.language === 'es' ? { ...preview, title: 'Piense en su propia experiencia', prompt: '¿Qué pregunta le queda sobre la apnea del sueño o el PAP después de esta sección?', placeholder: '¿Cómo sabré si el PAP está ayudando a mi sueño?' } : preview;
  return <AppScreen contentStyle={{ paddingTop: 54, gap: 10 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('backToModule')} onPress={() => router.replace('/' as Href)} style={{ minHeight: 44, width: 132, flexDirection: 'row', alignItems: 'center', gap: 4 }}><MaterialCommunityIcons name="arrow-left" size={20} color={palette.ink} /><Text style={{ color: palette.ink, fontSize: 14, fontWeight: '600' }}>{state.language === 'es' ? 'Módulo 1' : 'Module 1'}</Text></Pressable>
      <Text style={{ color: palette.inkMuted, fontSize: 12, fontWeight: '600' }}>{state.language === 'es' ? 'Paso 10 de 19' : 'Step 10 of 19'}</Text>
    </View>
    <ProgressMeter compact value={53} label={state.language === 'es' ? 'Paso 10 de 19' : 'Step 10 of 19'} />
    <View style={{ flexDirection: 'row', gap: 6 }}>
      <ActionButton wrapperStyle={{ flex: 1 }} buttonStyle={{ paddingHorizontal: 4 }} variant="secondary" label={t('previous')} icon="arrow-left" onPress={() => undefined} />
      <ActionButton wrapperStyle={{ flex: 0.68 }} buttonStyle={{ paddingHorizontal: 4 }} label={state.language === 'es' ? 'Escuchar' : 'Listen'} icon="volume-high" onPress={() => undefined} />
      <ActionButton wrapperStyle={{ flex: 1 }} buttonStyle={{ paddingHorizontal: 4 }} label={t('skipOptional')} icon="arrow-right" iconPosition="trailing" onPress={() => undefined} />
    </View>
    <LessonRenderer screen={screen} onSubmitted={() => undefined} />
  </AppScreen>;
}
