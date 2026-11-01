import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getModules, getModule } from '@/src/content';
import { useApp } from '@/src/state/AppProvider';
import { ActionButton, AppScreen, Card, ProgressMeter, StatusPill, elevation } from '@/src/components/ui';
import { speakScreen, stopNarration } from '@/src/services/narration';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { fontFamily, palette, radius, spacing, touchTarget, type as typeScale } from '@/src/theme/tokens';

export default function ModuleCompletionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { state } = useApp();
  const reducedMotion = useReducedMotion();
  const reveal = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const module = getModule(state.language, id);
  const modules = getModules(state.language);
  const next = module ? modules.find((candidate) => candidate.order === module.order + 1) : undefined;
  const lastScreen = module?.screens.at(-1);
  const es = state.language === 'es';

  useEffect(() => () => { void stopNarration(); }, []);
  useEffect(() => {
    if (reducedMotion) { reveal.setValue(1); return; }
    const animation = Animated.timing(reveal, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    animation.start();
    return () => animation.stop();
  }, [reducedMotion, reveal]);

  if (!module) return <AppScreen><Text style={styles.title}>{t('moduleComplete')}</Text></AppScreen>;

  const backToModules = () => {
    if (router.canDismiss()) router.dismissTo('/' as Href);
    else router.replace('/' as Href);
  };
  const continueFromCompletion = () => {
    if (next) router.replace(`/module/${next.id}` as Href);
    else backToModules();
  };
  const listen = async () => {
    if (!lastScreen || !state.narrationEnabled) return;
    await speakScreen(lastScreen, state.language, state.narrationRate, state.voiceByLocale[state.language], state.narrationPitch);
  };
  const continueLabel = next ? t('continueToNextModule', { module: next.shortTitle }) : t('backToModules');
  const reviewModuleLabel = es ? 'Repasar módulo' : 'Review Module';
  const reviewModule = () => router.canDismiss() ? router.dismissTo(`/module/${module.id}` as Href) : router.replace(`/module/${module.id}` as Href);
  const badgeScale = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  // The heading stays readable throughout the reveal; only a gentle fade/scale is added.
  const heroOpacity = reveal.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  const footer = <View style={styles.controls}>
    <ActionButton compact variant="secondary" accessibilityLabel={t('previous')} label={t('previous')} icon="arrow-left" onPress={() => lastScreen ? router.replace(`/lesson/${module.id}?screenId=${encodeURIComponent(lastScreen.id)}&direction=backward` as Href) : router.canGoBack() ? router.back() : router.replace(`/module/${module.id}` as Href)} />
    <ActionButton wrapperStyle={styles.controlNext} buttonStyle={styles.footerButton} label={continueLabel} icon={next ? 'arrow-right' : 'home-outline'} iconPosition="trailing" labelNumberOfLines={2} onPress={continueFromCompletion} />
  </View>;

  return <AppScreen width="reading" contentStyle={styles.content} footer={footer}>
    <View style={styles.topRow}>
      <ActionButton wrapperStyle={styles.backWrapper} buttonStyle={styles.back} variant="ghost" accessibilityLabel={`${t('backToModule')}: ${module.shortTitle}`} label={module.shortTitle} labelNumberOfLines={2} icon="arrow-left" textStyle={styles.backModule} onPress={reviewModule} />
      <ActionButton buttonStyle={styles.listen} variant="quiet" label={es ? 'Escuchar' : 'Listen'} icon="volume-high" textStyle={styles.listenText} disabled={!state.narrationEnabled} onPress={() => void listen()} />
    </View>
    <ProgressMeter compact value={100} label={es ? 'Módulo completado' : 'Module complete'} />
    <Animated.View style={[styles.hero, { opacity: heroOpacity, transform: [{ scale: badgeScale }] }]}>
      <View accessible={false} style={styles.ringOuter}><View style={styles.ringInner}>
        <View testID="completion-check" style={styles.check}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="check" size={44} color={palette.white} /></View>
      </View></View>
      <Text style={styles.kicker}>{es ? `MÓDULO ${module.order} COMPLETADO` : `MODULE ${module.order} COMPLETE`}</Text>
      <Text accessibilityRole="header" style={styles.title}>{t('moduleComplete')}</Text>
      <Text style={styles.subtitle}>{module.title}</Text>
    </Animated.View>
    <Card style={styles.statusCard}>
      <StatusPill complete label={t('completed')} />
      <View style={styles.savedRow}><MaterialCommunityIcons accessible={false} importantForAccessibility="no" name="cellphone-lock" size={20} color={palette.inkMuted} /><Text style={styles.savedCopy}>{t('completionSaved')}</Text></View>
    </Card>
    {next ? <Card style={[styles.nextCard, elevation('subtle')]}>
      <Text style={styles.nextLabel}>{es ? 'SIGUIENTE' : 'UP NEXT'} · {es ? 'MÓDULO' : 'MODULE'} {next.order}</Text>
      <Text style={styles.nextTitle}>{next.title}</Text>
      <Text style={styles.nextMeta}>{next.screens.length} {es ? 'pasos' : 'steps'} · ~{Math.max(3, Math.ceil(next.screens.length * 1.25))} min</Text>
    </Card> : null}
    <View style={styles.secondaryActions}>
      {next ? <ActionButton label={t('backToModules')} icon="home-outline" variant="secondary" onPress={backToModules} /> : null}
      <ActionButton label={reviewModuleLabel} icon="book-open-outline" variant="ghost" onPress={reviewModule} />
    </View>
  </AppScreen>;
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingTop: Platform.OS === 'web' ? 18 : 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  backWrapper: { flexShrink: 1, minWidth: 0 },
  back: { paddingLeft: 6, paddingRight: 14, minHeight: touchTarget, justifyContent: 'flex-start' },
  backModule: { fontSize: 16, textAlign: 'left' },
  listen: { minHeight: touchTarget - 2, paddingHorizontal: 14, gap: 6 },
  listenText: { fontSize: 15 },
  controls: { flexDirection: 'row', gap: 10, alignItems: 'stretch' },
  footerButton: { paddingHorizontal: 14, gap: 8 },
  // The next-module label can be long (especially in Spanish), so Previous is icon-only here.
  controlNext: { flex: 1, minWidth: 0 },
  hero: { alignItems: 'center', gap: 8, paddingTop: 12, paddingBottom: 4 },
  ringOuter: { width: 148, height: 148, borderRadius: 74, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.dawnSoft, marginBottom: 8 },
  ringInner: { width: 116, height: 116, borderRadius: 58, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.successSoft },
  check: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', backgroundColor: palette.success },
  kicker: { ...typeScale.eyebrow, color: palette.success },
  title: { ...typeScale.display, color: palette.ink, textAlign: 'center' },
  subtitle: { ...typeScale.body, color: palette.body, textAlign: 'center' },
  statusCard: { gap: 12, padding: 18, backgroundColor: palette.surface },
  savedRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  savedCopy: { flex: 1, color: palette.body, fontFamily: fontFamily.body, fontSize: 15.5, lineHeight: 22 },
  nextCard: { gap: 6, padding: 20, borderRadius: radius.lg, borderColor: palette.primary, borderWidth: 1.5 },
  nextLabel: { ...typeScale.eyebrow, color: palette.dawnInk },
  nextTitle: { ...typeScale.section, color: palette.ink },
  nextMeta: { ...typeScale.meta, color: palette.inkMuted },
  secondaryActions: { gap: 10 },
});
