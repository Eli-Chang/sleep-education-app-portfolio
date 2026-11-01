import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { palette } from '@/src/theme/tokens';

// Fixed star field so the illustration is identical on every render.
const stars: [number, number, number, number][] = [
  [268, 74, 1.4, 0.9], [248, 92, 1, 0.55], [286, 26, 1.1, 0.7], [364, 112, 1.3, 0.6], [196, 120, 0.9, 0.45],
  [128, 46, 0.8, 0.4], [382, 30, 0.9, 0.55], [300, 136, 0.8, 0.4], [160, 84, 1, 0.35], [72, 22, 0.9, 0.3],
];

/**
 * Decorative night-to-dawn backdrop for hero areas. Purely ornamental: it is
 * hidden from assistive technology and carries no educational meaning.
 */
export function NightSky({ moon = true }: { moon?: boolean }) {
  return <View accessible={false} aria-hidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
    <Svg width="100%" height="100%" viewBox="0 0 390 240" preserveAspectRatio="xMidYMin slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.nightDeep} />
          <Stop offset="0.7" stopColor={palette.night} />
          <Stop offset="1" stopColor={palette.nightSoft} />
        </LinearGradient>
        <RadialGradient id="dawn" cx="0.5" cy="1" rx="0.75" ry="0.55" fx="0.5" fy="1">
          <Stop offset="0" stopColor={palette.dawn} stopOpacity="0.42" />
          <Stop offset="0.55" stopColor={palette.dawn} stopOpacity="0.1" />
          <Stop offset="1" stopColor={palette.dawn} stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={palette.moon} stopOpacity="0.28" />
          <Stop offset="1" stopColor={palette.moon} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width="390" height="240" fill="url(#sky)" />
      <Ellipse cx="195" cy="250" rx="300" ry="120" fill="url(#dawn)" />
      {stars.map(([x, y, r, opacity]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={palette.moon} opacity={opacity} />)}
      {moon ? <>
        <Circle cx="224" cy="30" r="30" fill="url(#moonGlow)" />
        <Path d="M224 16 A14 14 0 1 0 224 44 A10 14 0 1 1 224 16 Z" fill={palette.moon} />
      </> : null}
      <Path d="M0 214 C 90 196, 170 222, 260 206 S 360 196, 390 202 L 390 240 L 0 240 Z" fill={palette.nightSoft} opacity="0.55" />
    </Svg>
  </View>;
}
