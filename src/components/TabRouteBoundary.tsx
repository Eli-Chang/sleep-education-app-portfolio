import { useIsFocused } from '@react-navigation/native';
import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

/**
 * Expo Router keeps tab scenes mounted on web. Removing inactive scenes from
 * layout and accessibility prevents their controls from remaining tabbable or
 * discoverable after the learner switches tabs.
 */
export function TabRouteBoundary({ children }: PropsWithChildren) {
  const focused = useIsFocused();
  return <View
    aria-hidden={!focused}
    accessibilityElementsHidden={!focused}
    importantForAccessibility={focused ? 'auto' : 'no-hide-descendants'}
    style={{ flex: 1, display: focused ? 'flex' : 'none' }}
  >{children}</View>;
}
