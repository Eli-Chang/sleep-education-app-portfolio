import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { depth, fontFamily, gradientPoints, motion, palette, radius, spacing, touchTarget, type as typeScale } from '@/src/theme/tokens';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

export function AppScreen({ children, scroll = true, contentStyle }: React.PropsWithChildren<{ scroll?: boolean; contentStyle?: StyleProp<ViewStyle> }>) {
  const insets = useSafeAreaInsets();
  const body = <View style={[styles.content, !scroll && styles.contentFill, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <BackgroundGradient />
      {scroll ? <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} keyboardVerticalOffset={insets.top}><ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">{body}</ScrollView></KeyboardAvoidingView> : body}
    </SafeAreaView>
  );
}

export function Header({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return <View style={styles.header}>
    {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>;
}

export function ProgressMeter({ value, label, compact = false }: { value: number; label: string; compact?: boolean }) {
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={`${label}: ${value}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} style={[styles.meterWrap, compact && styles.compactMeterWrap]}>
    {!compact ? <View style={styles.meterLabelRow}><Text style={styles.meterLabel}>{label}</Text><Text style={styles.meterValue}>{value}%</Text></View> : null}
    <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%` }]} /></View>
  </View>;
}

export function ActionButton({ label, icon, iconColor, iconPosition = 'leading', textColor, textStyle, variant = 'primary', compact = false, buttonStyle, wrapperStyle, ...props }: PressableProps & { label: string; icon?: keyof typeof MaterialCommunityIcons.glyphMap; iconColor?: string; iconPosition?: 'leading' | 'trailing'; textColor?: string; textStyle?: StyleProp<TextStyle>; variant?: 'primary' | 'secondary' | 'danger'; compact?: boolean; buttonStyle?: StyleProp<ViewStyle>; wrapperStyle?: StyleProp<ViewStyle> }) {
  const scale = useRef(new Animated.Value(1)).current;
  const [focused, setFocused] = useState(false);
  const reducedMotion = useReducedMotion();
  const useNativeDriver = Platform.OS !== 'web';
  const animate = (value: number) => reducedMotion ? scale.setValue(1) : Animated.timing(scale, { toValue: value, duration: motion.quick, useNativeDriver }).start();
  const iconElement = icon ? <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={icon} size={21} color={iconColor ?? (variant === 'primary' ? palette.onPrimary : variant === 'danger' ? palette.danger : palette.primaryDark)} /> : null;
  const textElement = !compact ? <Text style={[styles.buttonText, styles[`${variant}Text`], textColor ? { color: textColor } : null, textStyle]}>{label}</Text> : null;
  return <Animated.View style={[{ backgroundColor: 'transparent', transform: [{ scale }] }, wrapperStyle]}><Pressable
    accessibilityRole="button"
    {...props}
    accessibilityLabel={props.accessibilityLabel ?? label}
    onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
    onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
    onPressIn={(event) => { animate(motion.pressScale); props.onPressIn?.(event); }}
    onPressOut={(event) => { animate(1); props.onPressOut?.(event); }}
    style={({ pressed }) => [styles.button, compact && styles.compactButton, depth.none, styles[`${variant}Button`], buttonStyle, focused && styles.focused, pressed && styles.pressed, props.disabled && styles.disabled]}
    >
    {iconPosition === 'trailing' ? textElement : iconElement}
    {iconPosition === 'trailing' ? iconElement : textElement}
  </Pressable></Animated.View>;
}

export function StatusPill({ label, complete = false }: { label: string; complete?: boolean }) {
  return <View style={[styles.pill, complete && styles.completePill]}>
    <MaterialCommunityIcons accessible={false} importantForAccessibility="no" name={complete ? 'check-circle-outline' : 'progress-clock'} size={16} color={complete ? palette.success : palette.inkMuted} />
    <Text style={[styles.pillText, complete && { color: palette.success }]}>{label}</Text>
  </View>;
}

export function GradientSurface() {
  return <LinearGradient
    accessible={false}
    colors={[palette.cardGradientStart, palette.cardGradientEnd]}
    start={gradientPoints.cardStart}
    end={gradientPoints.cardEnd}
    style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}
  />;
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

export const Card = ({ children, style, ...props }: React.ComponentProps<typeof View>) => <View {...props} style={[styles.card, style]}>
  <GradientSurface />
  {children}
</View>;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  flex: { flex: 1, minHeight: 0 },
  scroll: { flexGrow: 1, paddingBottom: 136 },
  content: { width: '100%', maxWidth: 900, alignSelf: 'center', paddingHorizontal: 20, paddingTop: spacing.md, gap: spacing.lg },
  contentFill: { flex: 1, minHeight: 0 },
  header: { gap: spacing.sm, paddingTop: spacing.sm },
  eyebrow: { color: palette.primary, fontFamily: fontFamily.body, fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: palette.ink, fontFamily: fontFamily.heading, ...typeScale.title },
  subtitle: { color: palette.body, fontFamily: fontFamily.body, fontSize: 17, lineHeight: 27 },
  meterWrap: { gap: spacing.sm },
  compactMeterWrap: { gap: 0 },
  meterLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  meterLabel: { color: palette.ink, fontSize: 14, fontWeight: '700' },
  meterValue: { color: palette.primary, fontSize: 15, fontWeight: '800' },
  track: { height: 8, borderRadius: radius.pill, overflow: 'hidden', backgroundColor: palette.border },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: palette.primary },
  button: { minHeight: touchTarget, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: 9, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  compactButton: { width: touchTarget, paddingHorizontal: 0, gap: 0 },
  primaryButton: { backgroundColor: palette.primary, borderColor: palette.primary },
  secondaryButton: { backgroundColor: palette.surface, borderColor: palette.border },
  dangerButton: { backgroundColor: palette.surface, borderColor: palette.danger },
  buttonText: { fontFamily: fontFamily.body, fontSize: 16, fontWeight: '800' },
  primaryText: { color: palette.onPrimary },
  secondaryText: { color: palette.primary },
  dangerText: { color: palette.danger },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.62 },
  focused: { outlineWidth: 2, outlineColor: palette.focus, outlineOffset: 2 },
  card: { ...depth.none, backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.border, borderRadius: 22, overflow: 'hidden', padding: 18, gap: spacing.md },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.surfaceSoft, paddingHorizontal: 10, paddingVertical: 7, borderRadius: radius.pill },
  completePill: { backgroundColor: palette.successSoft },
  pillText: { color: palette.inkMuted, fontFamily: fontFamily.body, fontSize: 12, fontWeight: '800' },
});
