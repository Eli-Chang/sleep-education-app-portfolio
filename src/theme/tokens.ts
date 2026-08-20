export const palette = {
  background: '#0E1A2B', backgroundGradientStart: '#0A1424', backgroundGradientMid: '#0E1A2B', backgroundGradientEnd: '#162742',
  surface: '#121A33', surfaceSoft: '#2D291E', raised: '#1A2445',
  cardGradientStart: '#162A55', cardGradientEnd: '#3B2B58',
  ink: '#EDF1F6', inkMuted: '#A5B0C0', body: '#C6CEDA', primary: '#D6B46A', primaryDark: '#B79252',
  primarySoft: '#342716', reflectionSelected: '#3A3049', accent: '#A9B2FA', accentSoft: '#27283D', border: '#53617F',
  success: '#6FD1A0', successSoft: '#1F352E', warning: '#F3C97A', warningSoft: '#392F20',
  danger: '#FF9A8B', dangerSoft: '#392426', missed: '#F3C97A', disabled: '#5B6574',
  white: '#FFFFFF', focus: '#D7C9FF', onPrimary: '#091322',
};
export const gradientPoints = {
  // Card color boundary: approximately 130 degrees, running northeast to southwest.
  cardStart: { x: 0, y: 0.08 }, cardEnd: { x: 1, y: 0.92 },
  // Background color boundary: perpendicular to the cards, running northwest to southeast.
  backgroundStart: { x: 0.92, y: 0 }, backgroundEnd: { x: 0.08, y: 1 },
} as const;
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { xs: 8, sm: 12, md: 16, lg: 24, pill: 999 };
export const touchTarget = 48;
export const fontFamily = { heading: 'BricolageGrotesque', body: 'Karla' };
export const type = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: '800' as const, letterSpacing: -0.7 },
  title: { fontSize: 32, lineHeight: 39, fontWeight: '800' as const, letterSpacing: -0.6 },
  section: { fontSize: 24, lineHeight: 31, fontWeight: '800' as const, letterSpacing: -0.2 },
  question: { fontSize: 20, lineHeight: 30, fontWeight: '800' as const },
  body: { fontSize: 17, lineHeight: 27, fontWeight: '400' as const },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '700' as const },
};
export const depth = {
  none: {},
  subtle: { shadowColor: '#000000', shadowOpacity: 0.22, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  raised: { shadowColor: '#000000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 4 },
  floating: { shadowColor: '#000000', shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 7 },
};
export const motion = { quick: 120, fast: 160, standard: 180, slow: 280, reveal: 575, pressScale: 0.98, enterDistance: 8 };
