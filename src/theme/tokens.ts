// "Daybreak" design tokens: warm, low-glare paper for reading, with a deep
// night-indigo identity and a single dawn accent. Text/background pairs are
// chosen for WCAG AA (body text >= 10:1, secondary text >= 5:1).
export const palette = {
  // Canvas and surfaces
  background: '#F4F0E8', backgroundGradientStart: '#F7F3EC', backgroundGradientMid: '#F4F0E8', backgroundGradientEnd: '#EFE9DE',
  surface: '#FFFDF9', surfaceSoft: '#F8F4EC', raised: '#FFFFFF', sunken: '#EFE9DE',
  // Ink
  ink: '#172238', body: '#2F3A50', inkMuted: '#596277', white: '#FFFFFF',
  // Identity: night indigo + dawn
  night: '#22325F', nightDeep: '#18234A', nightSoft: '#33457E', onNight: '#F6F2EA', onNightMuted: '#C3CAE0',
  moon: '#F6E3C6', dawn: '#E59D6E', dawnInk: '#9E4D27', dawnSoft: '#FBEADF',
  primary: '#24346A', primaryDark: '#1A2752', primarySoft: '#E7EBF6', onPrimary: '#FFFFFF',
  accent: '#24346A', accentSoft: '#EEF1F8',
  // Lines
  border: '#E0D8CA', borderStrong: '#8C8475', hairline: 'rgba(23,34,56,0.08)',
  // Status (always paired with an icon and text, never color alone)
  success: '#2B6E4C', successSoft: '#E4F1E9', warning: '#7E5300', warningSoft: '#FBF0DA',
  danger: '#AE3727', dangerSoft: '#FBE8E4', missed: '#7E5300', disabled: '#A49C8E',
  reflectionSelected: '#FBEADF', focus: '#3555D1', focusOnNight: '#F6E3C6',
  // Legacy names kept for screens that still reference them.
  cardGradientStart: '#FFFDF9', cardGradientEnd: '#FFFDF9',
  goldGradientHighlight: '#2C3E78', goldGradientStart: '#24346A', goldGradientEnd: '#1F2D5C', goldBorder: '#1A2752', goldLowerEdge: '#121C3E',
};
export const gradientPoints = {
  cardStart: { x: 0, y: 0 }, cardEnd: { x: 1, y: 1 },
  backgroundStart: { x: 0.5, y: 0 }, backgroundEnd: { x: 0.5, y: 1 },
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { xs: 8, sm: 12, md: 16, lg: 22, xl: 28, pill: 999 };
export const touchTarget = 48;
// Static font files: pair each family with fontWeight 'normal' so browsers never
// synthesize faux bold on top of an already-bold face.
export const fontFamily = {
  heading: 'Newsreader-SemiBold', display: 'Newsreader-Medium', body: 'Atkinson', bodyBold: 'Atkinson-Bold',
};
export const type = {
  display: { fontFamily: fontFamily.display, fontSize: 34, lineHeight: 40, fontWeight: 'normal' as const, letterSpacing: -0.6 },
  title: { fontFamily: fontFamily.heading, fontSize: 30, lineHeight: 36, fontWeight: 'normal' as const, letterSpacing: -0.4 },
  section: { fontFamily: fontFamily.heading, fontSize: 22, lineHeight: 28, fontWeight: 'normal' as const, letterSpacing: -0.2 },
  lesson: { fontFamily: fontFamily.heading, fontSize: 27, lineHeight: 33, fontWeight: 'normal' as const, letterSpacing: -0.3 },
  question: { fontFamily: fontFamily.heading, fontSize: 22, lineHeight: 29, fontWeight: 'normal' as const },
  body: { fontFamily: fontFamily.body, fontSize: 18, lineHeight: 28, fontWeight: 'normal' as const },
  bodySmall: { fontFamily: fontFamily.body, fontSize: 15.5, lineHeight: 23, fontWeight: 'normal' as const },
  label: { fontFamily: fontFamily.bodyBold, fontSize: 16, lineHeight: 21, fontWeight: 'normal' as const },
  meta: { fontFamily: fontFamily.body, fontSize: 14, lineHeight: 19, fontWeight: 'normal' as const },
  eyebrow: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, lineHeight: 16, fontWeight: 'normal' as const, letterSpacing: 1.3, textTransform: 'uppercase' as const },
};
export const depth = {
  none: {},
  subtle: { shadowColor: '#1B2440', shadowOpacity: 0.07, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  raised: { shadowColor: '#1B2440', shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  floating: { shadowColor: '#1B2440', shadowOpacity: 0.16, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
};
export const motion = { quick: 120, fast: 160, standard: 180, slow: 280, reveal: 575, pressScale: 0.98, enterDistance: 8 };
export const layout = { readingWidth: 680, contentWidth: 760, gutter: 20 };
