import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { CurriculumImageAsset } from '@/src/content/image-registry';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';
import { spacing } from '@/src/theme/tokens';

export function LessonImageRow({ assets, locale }: { assets: CurriculumImageAsset[]; locale: 'en' | 'es' }) {
  const reducedMotion = useReducedMotion();

  return <View style={styles.wrapper}>
    <View style={styles.row} accessibilityRole="image" accessibilityLabel={assets.filter((asset) => !asset.decorative).map((asset) => asset.altText[locale]).join(' ')}>
      {assets.map((asset) => <View key={asset.id} style={styles.cell}>
        <Image
          source={asset.source}
          accessibilityLabel={asset.decorative ? undefined : asset.altText[locale]}
          accessible={!asset.decorative}
          contentFit="contain"
          transition={reducedMotion ? 0 : 180}
          style={[styles.image, { aspectRatio: asset.aspectRatio }]}
        />
      </View>)}
    </View>
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch' },
  cell: { flex: 1, minWidth: 0 },
  image: { width: '100%', maxHeight: 220 },
});
