import { Image } from 'expo-image';
import { router, useGlobalSearchParams, usePathname, useSegments, type Href } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette } from '@/src/theme/tokens';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { useTranslation } from 'react-i18next';
import { getVelaBottomOffset, isVelaReturnRoute } from './vela-layout';

export type VelaVisualState = 'idle' | 'conversation' | 'thinking' | 'error' | 'offline' | 'safety';

const idleAsset = require('../../assets/vela/vela-idle.svg');
const blinkAsset = require('../../assets/vela/vela-blink.svg');

export const VELA_NUDGE_FIRST_DELAY = 2400;
export const VELA_NUDGE_MIN_INTERVAL = 60_000;
export const VELA_NUDGE_INACTIVE_INTERVAL = 90_000;
export const VELA_NUDGE_MAX_PER_SESSION = 3;
export const VELA_BASELINE_TRANSITION_DURATION = 280;

type NudgeContextValue = { suppressedKeys: ReadonlySet<string>; setSuppressed: (key: string, suppressed: boolean) => void };
const NudgeContext = createContext<NudgeContextValue | undefined>(undefined);

export function VelaNudgeProvider({ children }: React.PropsWithChildren) {
  const [suppressedKeys, setSuppressedKeys] = useState<Set<string>>(new Set());
  const setSuppressed = useCallback((key: string, suppressed: boolean) => {
    setSuppressedKeys((current) => {
      const alreadySuppressed = current.has(key);
      if (alreadySuppressed === suppressed) return current;
      const next = new Set(current);
      if (suppressed) next.add(key); else next.delete(key);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ suppressedKeys, setSuppressed }), [setSuppressed, suppressedKeys]);
  return <NudgeContext.Provider value={value}>{children}</NudgeContext.Provider>;
}

export function useVelaNudgeSuppression(key: string, suppressed: boolean) {
  const context = useContext(NudgeContext);
  const setSuppressed = context?.setSuppressed;
  useEffect(() => {
    setSuppressed?.(key, suppressed);
    return () => setSuppressed?.(key, false);
  }, [key, setSuppressed, suppressed]);
}

export function VelaMascot({ state = 'idle', size = 56, onPress, accessibilityLabel = 'Open Vela' }: { state?: VelaVisualState; size?: number; onPress?: () => void; accessibilityLabel?: string }) {
  const reducedMotion = useReducedMotion();
  const useNativeDriver = Platform.OS !== 'web';
  const bob = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    if (reducedMotion) {
      bob.stopAnimation();
      glow.stopAnimation();
      bob.setValue(0);
      glow.setValue(state === 'thinking' ? 1 : 0);
      return;
    }
    const bobLoop = Animated.loop(Animated.sequence([
      Animated.delay(5200),
      Animated.timing(bob, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      Animated.timing(bob, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.sin), useNativeDriver }),
    ]));
    const glowLoop = state === 'thinking' ? Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver }),
      Animated.timing(glow, { toValue: 0.25, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver }),
    ])) : undefined;
    bobLoop.start();
    glowLoop?.start();
    return () => { bobLoop.stop(); glowLoop?.stop(); };
  }, [bob, glow, reducedMotion, state, useNativeDriver]);

  useEffect(() => {
    if (reducedMotion) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      if (!active) return;
      setBlinking(true);
      timer = setTimeout(() => { setBlinking(false); timer = setTimeout(blink, 5200); }, 160);
    };
    timer = setTimeout(blink, 4200);
    return () => { active = false; clearTimeout(timer); };
  }, [reducedMotion]);

  const imageSize = Math.max(32, Math.min(size, 64));
  const image = <Animated.View style={[styles.markWrap, { width: imageSize, height: imageSize, transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] }]}>
    {state === 'thinking' ? <Animated.View style={[styles.thinkingRing, { width: imageSize + 12, height: imageSize + 12, borderRadius: (imageSize + 12) / 2, opacity: glow, pointerEvents: 'none' }]} /> : null}
    <Image accessibilityLabel={accessibilityLabel} source={blinking ? blinkAsset : idleAsset} contentFit="contain" style={{ width: imageSize, height: imageSize }} />
  </Animated.View>;
  if (!onPress) return image;
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onPress}>{image}</Pressable>;
}

export function VelaLauncher({ onPress, accessibilityLabel = 'Open Vela', bottomOffset = 50, showNudge = false, visible = true, onOpen, onNudgeDismissed }: { onPress: () => void; accessibilityLabel?: string; bottomOffset?: number; showNudge?: boolean; visible?: boolean; onOpen?: () => void; onNudgeDismissed?: () => void }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const useNativeDriver = Platform.OS !== 'web';
  const [nudgeVisible, setNudgeVisible] = useState(false);
  const nudgeOpacity = useRef(new Animated.Value(0)).current;
  const nudgeOffset = useRef(new Animated.Value(10)).current;
  const baselineY = useRef(new Animated.Value(-bottomOffset)).current;
  const previousBaselineTarget = useRef(-bottomOffset);

  useEffect(() => {
    const target = -bottomOffset;
    const targetChanged = previousBaselineTarget.current !== target;
    previousBaselineTarget.current = target;
    baselineY.stopAnimation();
    if (reducedMotion || !targetChanged) {
      baselineY.setValue(target);
      return;
    }
    Animated.timing(baselineY, {
      toValue: target,
      duration: VELA_BASELINE_TRANSITION_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver,
    }).start();
  }, [baselineY, bottomOffset, reducedMotion, useNativeDriver]);

  useEffect(() => {
    if (!showNudge) {
      setNudgeVisible(false);
      nudgeOpacity.stopAnimation();
      nudgeOffset.stopAnimation();
      nudgeOpacity.setValue(0);
      nudgeOffset.setValue(10);
      return;
    }
    setNudgeVisible(true);
    if (reducedMotion) {
      nudgeOpacity.setValue(1);
      nudgeOffset.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(nudgeOpacity, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver }),
      Animated.timing(nudgeOffset, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver }),
    ]).start();
  }, [nudgeOffset, nudgeOpacity, reducedMotion, showNudge, useNativeDriver]);

  useEffect(() => {
    if (!nudgeVisible) return;
    const timer = setTimeout(() => {
      setNudgeVisible(false);
      nudgeOpacity.setValue(0);
      nudgeOffset.setValue(10);
      onNudgeDismissed?.();
    }, 5200);
    return () => clearTimeout(timer);
  }, [nudgeOffset, nudgeOpacity, nudgeVisible, onNudgeDismissed]);

  const openVela = () => {
    setNudgeVisible(false);
    nudgeOpacity.stopAnimation();
    nudgeOpacity.setValue(0);
    nudgeOffset.setValue(10);
    onOpen?.();
    onPress();
  };

  if (!visible) return null;
  return <Animated.View testID="vela-baseline-layer" style={[styles.chromeLayer, { transform: [{ translateY: baselineY }], pointerEvents: Platform.OS === 'web' ? 'none' : 'box-none' }]}>
    <View testID="vela-launcher" style={[styles.launcher, Platform.OS === 'web' && { pointerEvents: 'auto' }]}><VelaMascot onPress={openVela} accessibilityLabel={accessibilityLabel} /></View>
    {nudgeVisible ? <Animated.View testID="vela-nudge" style={[styles.nudge, { opacity: nudgeOpacity, transform: [{ translateX: nudgeOffset }] }, Platform.OS === 'web' && { pointerEvents: 'auto' }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('velaNudge')} onPress={openVela} style={({ pressed }) => [styles.nudgeButton, pressed && styles.pressed]}>
        <Text style={styles.nudgeText}>{t('velaNudge')}</Text>
      </Pressable>
    </Animated.View> : null}
  </Animated.View>;
}

export function VelaChrome() {
  const pathname = usePathname();
  const segments = useSegments();
  const { screenId } = useGlobalSearchParams<{ screenId?: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const context = useContext(NudgeContext);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const nudgeRef = useRef({
    lastPath: pathname,
    changesSinceShown: 0,
    nextThreshold: 3,
    shown: 0,
    lastShownAt: 0,
    lastActivityAt: Date.now(),
    opened: false,
  });
  const chatOpen = pathname === '/ai';
  const suppressed = Boolean(context && context.suppressedKeys.size > 0);
  const nudgeEligible = !chatOpen && !keyboardVisible && !suppressed && !nudgeRef.current.opened;
  const isTabRoute = segments[0] === '(tabs)';
  const hasLessonFooter = pathname.startsWith('/lesson/');
  const bottomOffset = getVelaBottomOffset({ isTabRoute, bottomInset: insets.bottom, hasLessonFooter });
  const currentRoute = pathname.startsWith('/lesson/') && typeof screenId === 'string' ? `${pathname}?screenId=${encodeURIComponent(screenId)}` : pathname;
  const returnTo = isVelaReturnRoute(currentRoute) ? currentRoute : undefined;
  const handleNudgeDismissed = useCallback(() => setShowNudge(false), []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const requestNudge = useCallback(() => {
    const current = nudgeRef.current;
    const now = Date.now();
    if (!nudgeEligible || current.opened || current.shown >= VELA_NUDGE_MAX_PER_SESSION || now - current.lastShownAt < VELA_NUDGE_MIN_INTERVAL) return;
    current.shown += 1;
    current.lastShownAt = now;
    current.changesSinceShown = 0;
    current.nextThreshold = 3 + Math.floor(Math.random() * 3);
    current.lastActivityAt = now;
    setShowNudge(true);
  }, [nudgeEligible]);

  useEffect(() => {
    const current = nudgeRef.current;
    if (current.lastPath === pathname) return;
    current.lastPath = pathname;
    current.changesSinceShown += 1;
    current.lastActivityAt = Date.now();
    if (current.changesSinceShown >= current.nextThreshold) requestNudge();
  }, [pathname, requestNudge]);

  useEffect(() => {
    const timer = setTimeout(requestNudge, VELA_NUDGE_FIRST_DELAY);
    return () => clearTimeout(timer);
  }, [requestNudge]);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = nudgeRef.current;
      if (current.changesSinceShown > 0 && Date.now() - current.lastActivityAt >= VELA_NUDGE_INACTIVE_INTERVAL) requestNudge();
    }, 15_000);
    return () => clearInterval(timer);
  }, [requestNudge]);

  useEffect(() => {
    if (!nudgeEligible) setShowNudge(false);
  }, [nudgeEligible]);

  useEffect(() => {
    const current = nudgeRef.current;
    if (nudgeEligible && current.changesSinceShown >= current.nextThreshold) requestNudge();
  }, [nudgeEligible, requestNudge]);

  return <VelaLauncher
    onPress={() => router.push({ pathname: '/ai', params: returnTo ? { returnTo } : {} } as Href)}
    onOpen={() => { nudgeRef.current.opened = true; setShowNudge(false); }}
    onNudgeDismissed={handleNudgeDismissed}
    accessibilityLabel={t('openVela')}
    bottomOffset={bottomOffset}
    showNudge={showNudge && nudgeEligible}
    visible={!chatOpen && !keyboardVisible}
  />;
}

const styles = StyleSheet.create({
  chromeLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 20 },
  launcher: { position: 'absolute', right: 18, bottom: 0, zIndex: 20 },
  nudge: { position: 'absolute', right: 58, bottom: 48, maxWidth: 190, zIndex: 21 },
  nudgeButton: { borderWidth: 1, borderColor: palette.accent, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: palette.raised },
  nudgeText: { color: palette.ink, fontSize: 13, lineHeight: 18, fontWeight: '700' },
  button: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  markWrap: { alignItems: 'center', justifyContent: 'center' },
  thinkingRing: { position: 'absolute', borderWidth: 1, borderColor: palette.accent, backgroundColor: 'transparent' },
  pressed: { opacity: 0.75 },
});
