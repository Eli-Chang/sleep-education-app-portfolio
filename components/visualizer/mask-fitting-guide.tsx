import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { useHaptics } from '@/hooks/use-haptics';

type MaskType = 'nasal' | 'fullface' | 'setup';

type Hotspot = {
  id: string;
  title: string;
  advice: string;
};

const MASK_TYPES: {
  id: MaskType;
  label: string;
  description: string;
  hotspots: Hotspot[];
}[] = [
  {
    id: 'nasal',
    label: 'Nasal Mask',
    description: 'Covers the nose only. Animated dual-wall silicone cushion inflates with air pressure for zero leaks.',
    hotspots: [
      { id: 'straps', title: 'Strap Tension', advice: 'Keep straps snug, not tight. You should fit two fingers underneath headgear.' },
      { id: 'seal', title: 'Cushion Seal', advice: 'Pull mask slightly away from face while air is running to inflate dual silicone walls.' },
      { id: 'vent', title: 'Air Vent', advice: 'Ensure quiet exhalation ports remain uncovered by blankets.' },
    ],
  },
  {
    id: 'fullface',
    label: 'Full Face Mask',
    description: 'Covers nose and mouth. Animated seal prevents air blowing into eyes during mouth breathing.',
    hotspots: [
      { id: 'bridge', title: 'Nasal Bridge', advice: 'Avoid over-tightening top straps to prevent red marks on nose bridge.' },
      { id: 'chin', title: 'Chin Support', advice: 'Bottom straps stabilize mask when jaw relaxes during deep REM sleep.' },
      { id: 'leak', title: 'Eye Leak Check', advice: 'If air blows into eyes, loosen top straps and pull mask cushion out to reset seal.' },
    ],
  },
  {
    id: 'setup',
    label: 'Bedtime Setup',
    description: 'Complete bedside layout with machine motor, humidifier, tubing, and mask in animated flow.',
    hotspots: [
      { id: 'chamber', title: 'Humidifier Chamber', advice: 'Fill with distilled water up to MAX line to prevent airway dryness.' },
      { id: 'tubing', title: 'Tubing Hose', advice: 'Keep hose elevated or use heated tubing to stop rainout condensation.' },
      { id: 'filter', title: 'Air Filter', advice: 'Check foam filter monthly and replace paper fine filters when discolored.' },
    ],
  },
];

export function MaskFittingGuide() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { triggerSelection } = useHaptics();
  const [selectedMask, setSelectedMask] = useState<MaskType>('nasal');
  const [activeHotspot, setActiveHotspot] = useState<string>('straps');

  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const current = MASK_TYPES.find((m) => m.id === selectedMask) ?? MASK_TYPES[0];
  const hotspot = current.hotspots.find((h) => h.id === activeHotspot) ?? current.hotspots[0];

  const handleMaskChange = (id: MaskType) => {
    triggerSelection();
    rotateY.value = withSpring(18, { damping: 10 }, () => {
      rotateY.value = withSpring(0, { damping: 14 });
    });
    scale.value = withSpring(0.94, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    setSelectedMask(id);
    const newMask = MASK_TYPES.find((m) => m.id === id);
    if (newMask && newMask.hotspots[0]) {
      setActiveHotspot(newMask.hotspots[0].id);
    }
  };

  const stage3DStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <GlassCard style={styles.container}>
      <Badge label="Animated Mask Guide" variant="secondary" style={{ marginBottom: Spacing.xs }} />
      <Text style={[styles.title, { color: colors.text }]}>Interactive Vector Mask Guide</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select a mask style to watch the animated silicone seal inflate and flex air channels in real-time.
      </Text>

      {/* Mask Selector Tabs */}
      <View style={styles.maskSelectorRow}>
        {MASK_TYPES.map((item) => {
          const active = item.id === selectedMask;
          return (
            <Pressable
              key={item.id}
              onPress={() => handleMaskChange(item.id)}
              style={[
                styles.maskTab,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.cardBorder,
                },
              ]}>
              <Text style={[styles.maskTabText, { color: active ? '#FFFFFF' : colors.text }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Animated Vector Stage */}
      <View style={[styles.graphicBox, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
        <Animated.View style={[{ width: '100%', height: 180, alignItems: 'center', justifyContent: 'center' }, stage3DStyle]}>
          {selectedMask === 'nasal' && (
            <View style={[styles.nasalCushionShell, { borderColor: '#06B6D4' }]}>
              <View style={[styles.innerChamber, { backgroundColor: '#38BDF8' }]} />
              <View style={[styles.strapHandle, styles.strapLeft]} />
              <View style={[styles.strapHandle, styles.strapRight]} />
            </View>
          )}

          {selectedMask === 'fullface' && (
            <View style={[styles.fullfaceCushionShell, { borderColor: '#818CF8' }]}>
              <View style={[styles.innerChamber, { backgroundColor: '#06B6D4' }]} />
              <View style={[styles.strapHandle, styles.strapLeft]} />
              <View style={[styles.strapHandle, styles.strapRight]} />
            </View>
          )}

          {selectedMask === 'setup' && (
            <View style={styles.setupAssemblyRow}>
              <View style={[styles.unitMotor, { backgroundColor: '#1E293B' }]}>
                <View style={styles.unitDisplay} />
              </View>
              <View style={[styles.waterBox, { backgroundColor: 'rgba(6,182,212,0.3)' }]} />
              <View style={styles.tubingHose} />
            </View>
          )}
        </Animated.View>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{current.description}</Text>
      </View>

      {/* Hotspots Buttons */}
      <View style={styles.hotspotsRow}>
        {current.hotspots.map((spot) => {
          const active = spot.id === activeHotspot;
          return (
            <Pressable
              key={spot.id}
              onPress={() => {
                triggerSelection();
                setActiveHotspot(spot.id);
              }}
              style={[
                styles.hotspotChip,
                {
                  backgroundColor: active ? colors.secondary : colors.card,
                  borderColor: active ? colors.secondary : colors.cardBorder,
                },
              ]}>
              <Text style={[styles.hotspotChipText, { color: active ? '#FFFFFF' : colors.text }]}>{spot.title}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Active Hotspot Tip Box */}
      <Animated.View key={activeHotspot} entering={FadeInUp.duration(240)} style={[styles.tipBox, { backgroundColor: colors.secondaryLight, borderColor: colors.secondary }]}>
        <Text style={[styles.tipTitle, { color: colors.secondary }]}>💡 {hotspot.title} Advice</Text>
        <Text style={[styles.tipText, { color: colors.text }]}>{hotspot.advice}</Text>
      </Animated.View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  maskSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  maskTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  maskTabText: {
    fontSize: 12,
    fontWeight: '800',
  },
  graphicBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  nasalCushionShell: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullfaceCushionShell: {
    width: 130,
    height: 145,
    borderRadius: BorderRadius.xl,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerChamber: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    opacity: 0.7,
  },
  strapHandle: {
    position: 'absolute',
    width: 50,
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: BorderRadius.sm,
  },
  strapLeft: {
    left: -40,
  },
  strapRight: {
    right: -40,
  },
  setupAssemblyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  unitMotor: {
    width: 90,
    height: 60,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitDisplay: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    backgroundColor: '#06B6D4',
  },
  waterBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  tubingHose: {
    width: 40,
    height: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FBBF24',
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  hotspotsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  hotspotChip: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  hotspotChipText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tipBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
