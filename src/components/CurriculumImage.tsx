import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import type { CurriculumImageAsset } from '@/src/content/image-registry';
import { useReducedMotion } from '@/src/hooks/useReducedMotion';

export function CurriculumImage({ asset, locale, compact = false }: { asset: CurriculumImageAsset; locale: 'en' | 'es'; compact?: boolean }) {
  const reducedMotion = useReducedMotion();
  return <View style={[styles.frame, compact && styles.compact]}>
    <Image
      source={asset.source}
      accessibilityLabel={asset.decorative ? undefined : asset.altText[locale]}
      accessible={!asset.decorative}
      contentFit="contain"
      transition={reducedMotion ? 0 : 180}
      style={[styles.image, { aspectRatio: asset.aspectRatio }]}
    />
  </View>;
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'stretch' },
  compact: { width: 82, alignSelf: 'center' },
  image: { width: '100%', maxHeight: 420 },
});
