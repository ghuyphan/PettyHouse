import { useCallback } from 'react';
import Animated, {
  useAnimatedStyle,
  interpolate,
  SharedValue
} from 'react-native-reanimated';

export const useHeaderAnimation = (windowHeight: number, bottomSheetPosition: SharedValue<number>, bottomSheetSnapPoint: number) => {
  const relativePosition = windowHeight - bottomSheetPosition.value;
  
  console.log(relativePosition);
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(relativePosition,  [bottomSheetSnapPoint - 50, bottomSheetSnapPoint], [1, 0], 'clamp'),
    marginBottom: interpolate(relativePosition,  [bottomSheetSnapPoint - 50, bottomSheetSnapPoint], [20, 10], 'clamp'),
    height: interpolate(relativePosition,  [bottomSheetSnapPoint - 50, bottomSheetSnapPoint], [30, 0], 'clamp')
  }));
  return { headerAnimatedStyle };
};
