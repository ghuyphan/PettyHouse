import { useCallback } from 'react';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolate,
  runOnJS,
  Easing
} from 'react-native-reanimated';

export const useBottomSheetTransitionManager = (setActiveView: (view: 'detail' | 'list') => void) => {
  const transition = useSharedValue(0);

  const showDetail = useCallback(() => {
    transition.value = withTiming(1, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    }, (isFinished) => {
      if (isFinished) {
        runOnJS(setActiveView)('detail'); // Ensure this runs after animation
      }
    });
  }, [setActiveView]);

  const showList = useCallback(() => {
    transition.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    }, (isFinished) => {
      if (isFinished) {
        runOnJS(setActiveView)('list'); // Ensure this runs after animation
      }
    });
  }, [setActiveView]);

  const listStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(transition.value, [0, 1], [0, -300]) // Adjust translation values as needed
      }
    ],
    opacity: interpolate(transition.value, [0, 1], [1, 0])
  }));

  const detailStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(transition.value, [0, 1], [300, 0]) // Slide in from the right
      }
    ],
    opacity: interpolate(transition.value, [0, 1], [0, 1])
  }));

  return { showDetail, showList, listStyle, detailStyle };
};
