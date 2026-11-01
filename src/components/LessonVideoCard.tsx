import { Image } from 'expo-image';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { LessonVideo, SupportedLocale } from '@/src/types/content';
import { fontFamily, palette, radius, spacing, touchTarget } from '@/src/theme/tokens';

export function LessonVideoCard({ video, locale }: { video: LessonVideo; locale: SupportedLocale }) {
  const title = video.title[locale];
  const watchLabel = locale === 'es' ? 'Ver en YouTube' : 'Watch on YouTube';
  return <View style={styles.card}>
    <Pressable
      testID="lesson-video-link"
      accessibilityRole="link"
      accessibilityLabel={title}
      onPress={() => void Linking.openURL(video.url)}
      style={({ pressed }) => [styles.thumbnailButton, pressed && styles.pressed]}
    >
      <Image source={{ uri: video.thumbnailUrl }} accessibilityLabel={video.altText[locale]} contentFit="cover" style={styles.thumbnail} />
      <View style={styles.playBadge}><Text style={styles.playIcon}>▶</Text></View>
    </Pressable>
    <Text style={styles.title}>{title}</Text>
    <Pressable accessibilityRole="link" accessibilityLabel={watchLabel} onPress={() => void Linking.openURL(video.url)} style={styles.watchButton}>
      <Text style={styles.watchLabel}>{watchLabel}</Text>
    </Pressable>
  </View>;
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, borderWidth: 1, borderColor: palette.border, borderRadius: radius.lg, padding: spacing.sm, backgroundColor: palette.surfaceSoft },
  thumbnailButton: { position: 'relative', overflow: 'hidden', borderRadius: radius.md, backgroundColor: palette.sunken },
  thumbnail: { width: '100%', aspectRatio: 16 / 9 },
  playBadge: { position: 'absolute', left: '50%', top: '50%', width: 52, height: 52, marginLeft: -26, marginTop: -26, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(24,35,74,0.88)' },
  playIcon: { color: palette.white, fontSize: 19, marginLeft: 3 },
  title: { color: palette.ink, fontFamily: fontFamily.heading, fontSize: 18, lineHeight: 23, fontWeight: 'normal', paddingHorizontal: 4 },
  watchButton: { minHeight: touchTarget, justifyContent: 'center', paddingHorizontal: 4 },
  watchLabel: { color: palette.primary, fontFamily: fontFamily.bodyBold, fontSize: 15, lineHeight: 20, fontWeight: 'normal', textDecorationLine: 'underline' },
  pressed: { opacity: 0.72 },
});
