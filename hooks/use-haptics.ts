import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function useHaptics() {
  const triggerImpact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.impactAsync(style);
      } catch {
        // Fallback for non-supported hardware
      }
    }
  };

  const triggerNotification = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.notificationAsync(type);
      } catch {
        // Fallback
      }
    }
  };

  const triggerSelection = () => {
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {
        // Fallback
      }
    }
  };

  return { triggerImpact, triggerNotification, triggerSelection };
}
