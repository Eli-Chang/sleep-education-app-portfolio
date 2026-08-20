import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';
import { useApp } from '@/src/state/AppProvider';

export function useReducedMotion() {
  const { state } = useApp();
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);
  return reduced || state.reduceMotion;
}
