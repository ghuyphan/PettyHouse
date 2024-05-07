import { useSharedValue, withTiming, useAnimatedStyle, interpolate, runOnJS, Easing } from 'react-native-reanimated';

export const useBottomSheetTransitionManager = (setActiveView: (view: 'detail' | 'list') => void) => {
  const transition = useSharedValue(0);

  const showDetail = () => {
    transition.value = withTiming(1, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    }, (isFinished) => {
      if (isFinished) {
        runOnJS(setActiveView)('detail');
      }
    });
  };

  const showList = () => {
    transition.value = withTiming(0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    }, (isFinished) => {
      if (isFinished) {
        runOnJS(setActiveView)('list');
      }
    });
  };

  const listStyle = useAnimatedStyle(() => {
    return {
        opacity: interpolate(transition.value, [0, 1], [1, 0]),
        transform: [{ translateX: interpolate(transition.value, [0, 1], [0, -300]) }],
        pointerEvents: transition.value === 1 ? 'none' : 'auto'
    };
});

const detailStyle = useAnimatedStyle(() => {
    return {
        opacity: interpolate(transition.value, [0, 1], [0, 1]),
        transform: [{ translateX: interpolate(transition.value, [0, 1], [300, 0]) }],
        pointerEvents: transition.value === 0 ? 'none' : 'auto'
    };
});


  return { showDetail, showList, listStyle, detailStyle };
};
