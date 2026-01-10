import type { ReactNode } from "react";
import type { ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { DAMPING_FACTOR, SWIPE_THRESHOLD, VELOCITY_THRESHOLD } from "./constants";
import type { SwipeDirection } from "./types";

export interface SwipeHandlerProps {
  children: ReactNode;
  enabled: boolean;
  swipeDirection: SwipeDirection[];
  onDismiss: () => void;
  style?: ViewStyle;
}

export function SwipeHandler({
  children,
  enabled,
  swipeDirection,
  onDismiss,
  style,
}: SwipeHandlerProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);

  const canSwipeLeft = swipeDirection.includes("left");
  const canSwipeRight = swipeDirection.includes("right");

  const panGesture = Gesture.Pan()
    .enabled(enabled)
    .onStart(() => {
      "worklet";
      isDragging.value = true;
    })
    .onUpdate((event) => {
      "worklet";
      const { translationX } = event;

      if (canSwipeLeft && translationX < 0) {
        translateX.value = translationX;
      } else if (canSwipeRight && translationX > 0) {
        translateX.value = translationX;
      }

      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const excess = Math.abs(translateX.value) - SWIPE_THRESHOLD;
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = direction * (SWIPE_THRESHOLD + excess * DAMPING_FACTOR);
      }
    })
    .onEnd((event) => {
      "worklet";
      isDragging.value = false;

      const shouldDismiss =
        Math.abs(event.translationX) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityX) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * 300, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        translateX.value = withTiming(0, { duration: 150 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={style ? [style, animatedStyle] : animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

export function useSwipeGesture(
  enabled: boolean,
  swipeDirection: SwipeDirection[],
  onDismiss: () => void
) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const canSwipeLeft = swipeDirection.includes("left");
  const canSwipeRight = swipeDirection.includes("right");

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .onUpdate((event) => {
      "worklet";
      const { translationX } = event;

      if (canSwipeLeft && translationX < 0) {
        translateX.value = translationX;
      } else if (canSwipeRight && translationX > 0) {
        translateX.value = translationX;
      }

      if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
        const excess = Math.abs(translateX.value) - SWIPE_THRESHOLD;
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = direction * (SWIPE_THRESHOLD + excess * DAMPING_FACTOR);
      }
    })
    .onEnd((event) => {
      "worklet";
      const shouldDismiss =
        Math.abs(event.translationX) > SWIPE_THRESHOLD ||
        Math.abs(event.velocityX) > VELOCITY_THRESHOLD;

      if (shouldDismiss) {
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withTiming(direction * 300, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onDismiss)();
      } else {
        translateX.value = withTiming(0, { duration: 150 });
      }
    });

  return { gesture, translateX, opacity };
}
