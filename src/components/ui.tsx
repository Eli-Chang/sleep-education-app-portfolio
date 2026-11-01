import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { depth, fontFamily, gradientPoints, layout, motion, palette, radius, spacing, touchTarget, type as typeScale } from '@/src/theme/tokens';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/** Web renders soft shadows with boxShadow; native uses the platform shadow props. */
export const elevation = (level: 'subtle' | 'raised' | 'floating'): ViewStyle => Platform.OS === 'web'
  ? { boxShadow: level === 'subtle' ? '0 1px 2px rgba(27,36,64,0.05), 0 4px 14px rgba(27,36,64,0.06)' : level === 'raised' ? '0 2px 4px rgba(27,36,64,0.05), 0 10px 28px rgba(27,36,64,0.09)' : '0 4px 8px rgba(27,36,64,0.08), 0 18px 40px rgba(27,36,64,0.16)' } as ViewStyle
  : depth[level];

export function AppScreen({ children, scroll = true, contentStyle, scrollKey, hero, footer, width = 'content' }: React.PropsWithChildren<{ scroll?: boolean; contentStyle?: StyleProp<ViewStyle>; scrollKey?: string; hero?: React.ReactNode; footer?: React.ReactNode; width?: 'content' | 'reading' }>) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  useEffect(() => {
    if (scroll && scrollKey !== undefined) scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [scroll, scrollKey]);
  const body = <View style={[styles.content, width === 'reading' && styles.readingContent, !scroll && styles.contentFill, footer ? styles.contentWithFooter : null, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={hero ? ['bottom'] : ['top', 'bottom']}>
      <BackgroundGradient />
      {scroll ? <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} keyboardVerticalOffset={insets.top}>
        <ScrollView ref={scrollRef} contentContainerStyle={[styles.scroll, footer ? styles.scrollWithFooter : null]} keyboardShouldPersistTaps="handled">{hero}{body}</ScrollView>
        {footer ? <View style={styles.footer}><View style={[styles.footerInner, width === 'reading' && styles.readingFooter]}>{footer}</View></View> : null}
      </KeyboardAvoidingView> : <>{hero}{body}{footer}</>}
    </SafeAreaView>
  );
}

export function Header({ eyebrow, title, subtitle, tone = 'light' }: { eyebrow?: string; title: string; subtitle?: string; tone?: 'light' | 'night' }) {
  return <View style={styles.header}>
    {eyebrow ? <Text style={[styles.eyebrow, tone === 'night' && styles.eyebrowNight]}>{eyebrow}</Text> : null}
    <Text accessibilityRole="header" style={[styles.title, tone === 'night' && styles.titleNight]}>{title}</Text>
    {subtitle ? <Text style={[styles.subtitle, tone === 'night' && styles.subtitleNight]}>{subtitle}</Text> : null}
  </View>;
}

export function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return <View style={styles.sectionHeading}>
    <Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text>
    {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
  </View>;
}

/**
 * Progress bar with progressbar semantics. With `steps`, it renders one
 * segment per lesson step so position is readable without relying on color.
 */
export function ProgressMeter({ value, label, compact = false, steps, tone = 'light' }: { value: number; label: string; compact?: boolean; steps?: { total: number; current: number }; tone?: 'light' | 'night' }) {
  const clamped = Math.max(0, Math.min(100, value));
  const segmented = steps && steps.total <= 32;
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={`${label}: ${clamped}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped} style={[styles.meterWrap, compact && styles.compactMeterWrap]}>
    {!compact ? <View style={styles.meterLabelRow}><Text style={[styles.meterLabel, tone === 'night' && styles.meterLabelNight]}>{label}</Text><Text style={[styles.meterValue, tone === 'night' && styles.meterValueNight]}>{clamped}%</Text></View> : null}
    {segmented ? <View style={styles.segments}>{Array.from({ length: steps.total }, (_, index) => <View key={index} style={[styles.segment, index < steps.current && styles.segmentDone, index === steps.current - 1 && styles.segmentCurrent]} />)}</View>
      : <View style={[styles.track, tone === 'night' && styles.trackNight]}><View style={[styles.fill, tone === 'night' && styles.fillNight, { width: `${clamped}%` }]} /></View>}
  </View>;
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost' | 'quiet' | 'onNight';

export function ActionButton({ label, labelNumberOfLines = 1, icon, iconColor, iconPosition = 'leading', textColor, textStyle, variant = 'primary', compact = false, buttonStyle, wrapperStyle, ...props }: PressableProps & { label: string; labelNumberOfLines?: number; icon?: IconName; iconColor?: string; iconPosition?: 'leading' | 'trailing'; textColor?: string; textStyle?: StyleProp<TextStyle>; variant?: ButtonVariant; compact?: boolean; buttonStyle?: StyleProp<ViewStyle>; wrapperStyle?: StyleProp<ViewStyle> }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const useNativeDriver = Platform.OS !== 'web';
  const animate = (value: number) => reducedMotion ? scale.setValue(1) : Animated.timing(scale, { toValue: value, duration: motion.quick, useNativeDriver }).start();
  const resolved = variant === 'gold' ? 'primary' : variant;
  const foreground = textColor ?? (resolved === 'primary' ? palette.onPrimary : resolved === 'danger' ? palette.danger : resolved === 'onNight' ? palette.night : palette.primary);
  const iconElement = icon ? <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={icon} size={20} color={iconColor ?? foreground} /> : null;
  const textElement = !compact ? <Text numberOfLines={labelNumberOfLines} style={[styles.buttonText, { color: foreground }, textStyle]}>{label}</Text> : null;
  return <Animated.View style={[{ transform: [{ scale }] }, wrapperStyle]}><Pressable
    accessibilityRole="button"
    {...props}
    accessibilityLabel={props.accessibilityLabel ?? label}
    onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
    onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
    onPressIn={(event) => { animate(motion.pressScale); props.onPressIn?.(event); }}
    onPressOut={(event) => { animate(1); props.onPressOut?.(event); }}
    style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [styles.button, compact && styles.compactButton, styles[`${resolved}Button`], hovered && !props.disabled && styles[`${resolved}Hover`], buttonStyle, focused && (resolved === 'onNight' ? styles.focusedOnNight : styles.focused), pressed && styles.pressed, props.disabled && styles.disabled]}
    >
    {iconPosition === 'trailing' ? textElement : iconElement}
    {iconPosition === 'trailing' ? iconElement : textElement}
  </Pressable></Animated.View>;
}

export function IconButton({ icon, accessibilityLabel, onPress, tone = 'light', size = touchTarget }: { icon: IconName; accessibilityLabel: string; onPress: () => void; tone?: 'light' | 'night'; size?: number }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed }) => [styles.iconButton, { width: size, height: size, borderRadius: size / 2 }, tone === 'night' && styles.iconButtonNight, focused && (tone === 'night' ? styles.focusedOnNight : styles.focused), pressed && styles.pressed]}>
    <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={icon} size={22} color={tone === 'night' ? palette.onNight : palette.primary} />
  </Pressable>;
}

/** Compact translucent pill for actions placed on the night-sky hero. */
export function NightPillButton({ label, icon, onPress, accessibilityLabel, accessibilityLanguage }: { label: string; icon: IconName; onPress: () => void; accessibilityLabel?: string; accessibilityLanguage?: string }) {
  const [focused, setFocused] = useState(false);
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityLanguage={accessibilityLanguage} onPress={onPress} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [styles.nightPill, hovered && styles.nightPillHover, focused && styles.focusedOnNight, pressed && styles.pressed]}>
    <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={icon} size={17} color={palette.onNight} />
    <Text style={styles.nightPillText}>{label}</Text>
  </Pressable>;
}

export function StatusPill({ label, complete = false, tone, icon }: { label: string; complete?: boolean; tone?: 'neutral' | 'progress' | 'complete'; icon?: IconName }) {
  const resolved = tone ?? (complete ? 'complete' : 'neutral');
  const color = resolved === 'complete' ? palette.success : resolved === 'progress' ? palette.dawnInk : palette.inkMuted;
  return <View style={[styles.pill, resolved === 'complete' && styles.completePill, resolved === 'progress' && styles.progressPill]}>
    <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={icon ?? (resolved === 'complete' ? 'check-circle' : resolved === 'progress' ? 'circle-slice-3' : 'circle-outline')} size={15} color={color} />
    <Text style={[styles.pillText, { color }]}>{label}</Text>
  </View>;
}

/** Flat card fill kept for components that layer content over a surface. */
export function GradientSurface() {
  return <View accessible={false} style={[StyleSheet.absoluteFillObject, styles.surfaceFill, { pointerEvents: 'none' }]} />;
}

export function BackgroundGradient() {
  return <LinearGradient
    accessible={false}
    colors={[palette.backgroundGradientStart, palette.backgroundGradientMid, palette.backgroundGradientEnd]}
    start={gradientPoints.backgroundStart}
    end={gradientPoints.backgroundEnd}
    style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}
  />;
}

export const Card = ({ children, style, tone = 'default', ...props }: React.ComponentProps<typeof View> & { tone?: 'default' | 'tint' | 'night' }) => <View {...props} style={[styles.card, tone === 'tint' && styles.cardTint, tone === 'night' && styles.cardNight, style]}>
  {children}
</View>;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  flex: { flex: 1, minHeight: 0 },
  scroll: { flexGrow: 1, paddingBottom: 120 },
  scrollWithFooter: { paddingBottom: 24 },
  content: { width: '100%', maxWidth: layout.contentWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingTop: spacing.md, gap: spacing.lg },
  readingContent: { maxWidth: layout.readingWidth + layout.gutter * 2 },
  contentWithFooter: { paddingBottom: spacing.md },
  contentFill: { flex: 1, minHeight: 0 },
  footer: { borderTopWidth: 1, borderTopColor: palette.border, backgroundColor: 'rgba(255,253,249,0.97)', paddingTop: 12, paddingBottom: 12 },
  footerInner: { width: '100%', maxWidth: layout.contentWidth, alignSelf: 'center', paddingHorizontal: layout.gutter },
  readingFooter: { maxWidth: layout.readingWidth + layout.gutter * 2 },
  header: { gap: spacing.sm },
  eyebrow: { ...typeScale.eyebrow, color: palette.dawnInk },
  eyebrowNight: { color: palette.dawn },
  title: { ...typeScale.title, color: palette.ink },
  titleNight: { ...typeScale.display, color: palette.onNight },
  subtitle: { ...typeScale.bodySmall, fontSize: 17, lineHeight: 26, color: palette.body },
  subtitleNight: { color: palette.onNightMuted },
  sectionHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.md },
  sectionTitle: { ...typeScale.section, color: palette.ink },
  sectionHint: { ...typeScale.meta, color: palette.inkMuted },
  meterWrap: { gap: spacing.sm },
  compactMeterWrap: { gap: 0 },
  meterLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meterLabel: { ...typeScale.meta, color: palette.body },
  meterLabelNight: { color: palette.onNightMuted },
  meterValue: { ...typeScale.label, fontSize: 15, color: palette.primary },
  meterValueNight: { color: palette.onNight },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: palette.sunken },
  trackNight: { backgroundColor: 'rgba(246,242,234,0.18)' },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.primary },
  fillNight: { backgroundColor: palette.dawn },
  segments: { flexDirection: 'row', gap: 3, height: 6 },
  segment: { flex: 1, borderRadius: radius.pill, backgroundColor: palette.sunken },
  segmentDone: { backgroundColor: palette.primary },
  segmentCurrent: { backgroundColor: palette.dawn },
  button: { minHeight: touchTarget + 4, borderRadius: radius.pill, paddingHorizontal: 22, paddingVertical: 10, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent' },
  compactButton: { width: touchTarget + 4, minHeight: touchTarget + 4, paddingHorizontal: 0, gap: 0 },
  primaryButton: { backgroundColor: palette.primary, borderColor: palette.primary, ...(Platform.OS === 'web' ? { boxShadow: '0 1px 1px rgba(27,36,64,0.12), 0 6px 16px rgba(36,52,106,0.22)' } as ViewStyle : depth.subtle) },
  primaryHover: { backgroundColor: palette.primaryDark },
  secondaryButton: { backgroundColor: palette.surface, borderColor: palette.borderStrong },
  secondaryHover: { backgroundColor: palette.primarySoft },
  dangerButton: { backgroundColor: palette.surface, borderColor: palette.danger },
  dangerHover: { backgroundColor: palette.dangerSoft },
  goldButton: {},
  goldHover: {},
  ghostButton: { backgroundColor: 'transparent', paddingHorizontal: 12 },
  ghostHover: { backgroundColor: palette.primarySoft },
  quietButton: { backgroundColor: palette.primarySoft, borderColor: palette.primarySoft },
  quietHover: { borderColor: palette.primary },
  onNightButton: { backgroundColor: palette.onNight, borderColor: palette.onNight },
  onNightHover: { backgroundColor: palette.moon },
  buttonText: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 16.5, lineHeight: 21, flexShrink: 1, textAlign: 'center' },
  pressed: { opacity: 0.86 },
  disabled: { opacity: 0.42 },
  focused: { outlineWidth: 3, outlineStyle: 'solid', outlineColor: palette.focus, outlineOffset: 2 } as ViewStyle,
  focusedOnNight: { outlineWidth: 3, outlineStyle: 'solid', outlineColor: palette.focusOnNight, outlineOffset: 2 } as ViewStyle,
  nightPill: { minHeight: touchTarget - 2, flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(246,242,234,0.35)', backgroundColor: 'rgba(246,242,234,0.1)' },
  nightPillHover: { backgroundColor: 'rgba(246,242,234,0.2)' },
  nightPillText: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 14.5, lineHeight: 19, color: palette.onNight },
  iconButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border },
  iconButtonNight: { backgroundColor: 'rgba(246,242,234,0.12)', borderColor: 'rgba(246,242,234,0.28)' },
  card: { ...elevation('subtle'), backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: radius.lg, padding: 20, gap: spacing.md },
  cardTint: { backgroundColor: palette.surfaceSoft, ...(Platform.OS === 'web' ? { boxShadow: 'none' } as ViewStyle : depth.none) },
  cardNight: { backgroundColor: palette.night, borderColor: palette.night },
  surfaceFill: { backgroundColor: palette.surface },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.surfaceSoft, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  completePill: { backgroundColor: palette.successSoft, borderColor: 'rgba(43,110,76,0.25)' },
  progressPill: { backgroundColor: palette.dawnSoft, borderColor: 'rgba(158,77,39,0.22)' },
  pillText: { fontFamily: fontFamily.bodyBold, fontWeight: 'normal', fontSize: 13, lineHeight: 17 },
});
