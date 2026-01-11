import { useCallback, useEffect, useMemo, useRef } from "react";
import { Pressable, Text, View, type ViewStyle, type TextStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  ANIMATION_DEFAULTS,
  DAMPING_FACTOR,
  ENTRY_OFFSET,
  SNAP_BACK_DURATION,
  SWIPE_EXIT_DISTANCE,
  SWIPE_THRESHOLD,
  VELOCITY_THRESHOLD,
} from "./constants";
import { CloseIcon, getIcon } from "./icons";
import { baseStyles, getIconColor, getToastColors } from "./theme";
import type { AnimationConfig, ToastIcons, ToastProps, ToastT, ToastType } from "./types";
import { usePauseableTimer } from "./use-pauseable-timer";

let Haptics: typeof import("expo-haptics") | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Haptics = require("expo-haptics");
} catch {
  // expo-haptics not available
}

function triggerHaptic(type: "light" | "medium" | "success" | "warning" | "error" = "light"): void {
  if (!Haptics) return;

  try {
    switch (type) {
      case "success":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case "warning":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case "error":
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case "medium":
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      default:
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // ignore
  }
}

function getSpringConfig(animation: Required<AnimationConfig>) {
  return {
    damping: animation.damping,
    stiffness: animation.stiffness,
    mass: animation.mass,
  };
}

function ToastIcon({
  icon,
  icons,
  type,
  iconColor,
}: {
  icon?: React.ReactNode;
  icons?: ToastIcons;
  type: ToastType;
  iconColor: string;
}) {
  if (icon) {
    return <View style={baseStyles.iconContainer}>{icon}</View>;
  }

  if (icons && type in icons) {
    const customIcon = icons[type as keyof ToastIcons];
    if (customIcon) {
      return <View style={baseStyles.iconContainer}>{customIcon}</View>;
    }
  }

  const defaultIcon = getIcon(type, iconColor);
  if (defaultIcon) {
    return <View style={baseStyles.iconContainer}>{defaultIcon}</View>;
  }

  return null;
}

function ToastActions({
  toast,
  action,
  cancel,
  toastColors,
  defaultStyles,
  variantStyle,
  hapticFeedback,
}: {
  toast: ToastT;
  action?: ToastT["action"];
  cancel?: ToastT["cancel"];
  toastColors: ReturnType<typeof getToastColors>;
  defaultStyles?: ToastProps["defaultStyles"];
  variantStyle?: ToastProps["defaultStyles"];
  hapticFeedback: boolean;
}) {
  const handleActionPress = useCallback(() => {
    if (hapticFeedback) triggerHaptic("medium");
    action?.onClick(toast);
  }, [action, toast, hapticFeedback]);

  const handleCancelPress = useCallback(() => {
    if (hapticFeedback) triggerHaptic("light");
    cancel?.onClick(toast);
  }, [cancel, toast, hapticFeedback]);

  if (!action && !cancel) return null;

  const cancelButtonStyle: ViewStyle = {
    ...baseStyles.cancelButton,
    borderColor: toastColors.border,
    ...(defaultStyles?.cancelButton as ViewStyle),
    ...(variantStyle?.cancelButton as ViewStyle),
    ...(toast.styles?.cancelButton as ViewStyle),
    ...(cancel?.style as ViewStyle),
  };

  const cancelTextStyle: TextStyle = {
    ...baseStyles.cancelButtonText,
    color: toastColors.description,
    ...(defaultStyles?.cancelButtonText as TextStyle),
    ...(variantStyle?.cancelButtonText as TextStyle),
    ...(toast.styles?.cancelButtonText as TextStyle),
    ...(cancel?.textStyle as TextStyle),
  };

  const actionButtonStyle: ViewStyle = {
    ...baseStyles.actionButton,
    backgroundColor: toastColors.foreground,
    ...(defaultStyles?.actionButton as ViewStyle),
    ...(variantStyle?.actionButton as ViewStyle),
    ...(toast.styles?.actionButton as ViewStyle),
    ...(action?.style as ViewStyle),
  };

  const actionTextStyle: TextStyle = {
    ...baseStyles.actionButtonText,
    color: toastColors.background,
    ...(defaultStyles?.actionButtonText as TextStyle),
    ...(variantStyle?.actionButtonText as TextStyle),
    ...(toast.styles?.actionButtonText as TextStyle),
    ...(action?.textStyle as TextStyle),
  };

  return (
    <View style={baseStyles.actionsContainer}>
      {cancel && (
        <Pressable
          onPress={handleCancelPress}
          style={cancelButtonStyle}
          accessibilityLabel={cancel.label}
        >
          <Text style={cancelTextStyle}>{cancel.label}</Text>
        </Pressable>
      )}

      {action && (
        <Pressable
          onPress={handleActionPress}
          style={actionButtonStyle}
          accessibilityLabel={action.label}
        >
          <Text style={actionTextStyle}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function Toast({
  toast,
  position,
  gap,
  swipeToDismiss,
  swipeDirection,
  theme,
  richColors,
  closeButton,
  icons,
  defaultStyles,
  variantStyles,
  defaultAnimation = ANIMATION_DEFAULTS,
  onDismiss,
  duration,
  pauseOnAppBackground,
  hapticFeedback = false,
}: ToastProps) {
  const animation: Required<AnimationConfig> = useMemo(() => {
    const toastAnim = toast.animation;
    return {
      duration: toastAnim?.duration ?? defaultAnimation.duration ?? ANIMATION_DEFAULTS.duration,
      exitDuration: toastAnim?.exitDuration ?? defaultAnimation.exitDuration ?? ANIMATION_DEFAULTS.exitDuration,
      useSpring: toastAnim?.useSpring ?? defaultAnimation.useSpring ?? ANIMATION_DEFAULTS.useSpring,
      damping: toastAnim?.damping ?? defaultAnimation.damping ?? ANIMATION_DEFAULTS.damping,
      stiffness: toastAnim?.stiffness ?? defaultAnimation.stiffness ?? ANIMATION_DEFAULTS.stiffness,
      mass: toastAnim?.mass ?? defaultAnimation.mass ?? ANIMATION_DEFAULTS.mass,
    };
  }, [defaultAnimation, toast.animation]);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(position.startsWith("top") ? -ENTRY_OFFSET : ENTRY_OFFSET);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const isExiting = useRef(false);

  const canSwipeLeft = swipeDirection.includes("left");
  const canSwipeRight = swipeDirection.includes("right");

  const { type, title, description, action, cancel, icon, dismissible = true } = toast;
  const toastColors = getToastColors(type, theme, richColors);

  const hasCustomIcon = Boolean(icon) || Boolean(icons?.[type as keyof ToastIcons]);
  const iconColor = useMemo(() => {
    if (hasCustomIcon || type === "default") return "";
    return getIconColor(type, theme, richColors);
  }, [hasCustomIcon, type, theme, richColors]);

  const hasIcon = hasCustomIcon || type !== "default";

  useEffect(() => {
    if (animation.useSpring) {
      const springConfig = getSpringConfig(animation);
      opacity.value = withTiming(1, { duration: animation.duration * 0.6 });
      translateY.value = withSpring(0, springConfig);
      scale.value = withSpring(1, springConfig);
    } else {
      const timingConfig = {
        duration: animation.duration,
        easing: Easing.bezier(0.19, 1, 0.22, 1),
      };
      opacity.value = withTiming(1, { duration: animation.duration * 0.6 });
      translateY.value = withTiming(0, timingConfig);
      scale.value = withTiming(1, timingConfig);
    }

    if (hapticFeedback) {
      const hapticType = type === "success" ? "success"
        : type === "error" ? "error"
        : type === "warning" ? "warning"
        : "light";
      triggerHaptic(hapticType);
    }
  }, [opacity, translateY, scale, animation, hapticFeedback, type]);

  const handleDismiss = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;

    const exitOffset = position.startsWith("top") ? -ENTRY_OFFSET : ENTRY_OFFSET;
    const exitConfig = {
      duration: animation.exitDuration,
      easing: Easing.bezier(0.4, 0, 1, 1),
    };

    opacity.value = withTiming(0, { duration: animation.exitDuration * 0.7 });
    translateY.value = withTiming(exitOffset, exitConfig);
    scale.value = withTiming(0.95, exitConfig);

    setTimeout(() => onDismiss(toast.id), animation.exitDuration);
  }, [opacity, translateY, scale, position, onDismiss, toast.id, animation.exitDuration]);

  const delayedDismiss = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;
    setTimeout(() => onDismiss(toast.id), animation.exitDuration);
  }, [onDismiss, toast.id, animation.exitDuration]);

  const effectiveDuration = toast.duration ?? duration;
  const shouldAutoDismiss =
    effectiveDuration > 0 &&
    effectiveDuration !== Number.POSITIVE_INFINITY &&
    toast.type !== "loading";

  const handleAutoClose = useCallback(() => {
    toast.onAutoClose?.(toast);
    handleDismiss();
  }, [toast, handleDismiss]);

  usePauseableTimer(handleAutoClose, effectiveDuration, shouldAutoDismiss, pauseOnAppBackground);

  const panGesture = Gesture.Pan()
    .enabled(swipeToDismiss && dismissible)
    .onUpdate((event) => {
      "worklet";
      if (canSwipeLeft && event.translationX < 0) {
        translateX.value = event.translationX;
      } else if (canSwipeRight && event.translationX > 0) {
        translateX.value = event.translationX;
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
        translateX.value = withTiming(
          direction * SWIPE_EXIT_DISTANCE,
          { duration: animation.exitDuration }
        );
        opacity.value = withTiming(0, { duration: animation.exitDuration });
        runOnJS(delayedDismiss)();
      } else {
        translateX.value = withTiming(0, { duration: SNAP_BACK_DURATION });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  // Get variant-specific styles if defined
  const variantStyle = variantStyles?.[type];

  const containerStyle: ViewStyle = {
    ...baseStyles.container,
    backgroundColor: toastColors.background,
    borderColor: toastColors.border,
    marginBottom: gap,
    ...(defaultStyles?.container as ViewStyle),
    ...(variantStyle?.container as ViewStyle),
    ...(toast.styles?.container as ViewStyle),
  };

  const contentStyle: ViewStyle = {
    ...baseStyles.content,
    ...(!hasIcon ? baseStyles.contentNoIcon : {}),
    ...(defaultStyles?.content as ViewStyle),
    ...(variantStyle?.content as ViewStyle),
    ...(toast.styles?.content as ViewStyle),
  };

  const titleStyle: TextStyle = {
    ...baseStyles.title,
    color: toastColors.foreground,
    ...(defaultStyles?.title as TextStyle),
    ...(variantStyle?.title as TextStyle),
    ...(toast.styles?.title as TextStyle),
  };

  const descriptionStyle: TextStyle = {
    ...baseStyles.description,
    color: toastColors.description,
    ...(defaultStyles?.description as TextStyle),
    ...(variantStyle?.description as TextStyle),
    ...(toast.styles?.description as TextStyle),
  };

  const closeButtonStyle: ViewStyle = {
    ...baseStyles.closeButton,
    ...(defaultStyles?.closeButton as ViewStyle),
    ...(variantStyle?.closeButton as ViewStyle),
    ...(toast.styles?.closeButton as ViewStyle),
  };

  const accessibilityLabel = toast.accessibility?.accessibilityLabel
    ?? (typeof title === "string" ? title : undefined);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[containerStyle, animatedStyle]}
        accessible={true}
        accessibilityLabel={accessibilityLabel}
      >
        <ToastIcon
          icon={icon}
          icons={icons}
          type={type}
          iconColor={iconColor}
        />

        <View style={contentStyle}>
          {typeof title === "string" ? (
            <Text style={titleStyle} numberOfLines={2}>
              {title}
            </Text>
          ) : (
            title
          )}

          {description &&
            (typeof description === "string" ? (
              <Text style={descriptionStyle} numberOfLines={3}>
                {description}
              </Text>
            ) : (
              description
            ))}
        </View>

        <ToastActions
          toast={toast}
          action={action}
          cancel={cancel}
          toastColors={toastColors}
          defaultStyles={defaultStyles}
          variantStyle={variantStyle}
          hapticFeedback={hapticFeedback}
        />

        {closeButton && dismissible && (
          <Pressable
            onPress={handleDismiss}
            style={closeButtonStyle}
            hitSlop={8}
            accessibilityLabel="Close notification"
          >
            <CloseIcon color={toastColors.description} />
          </Pressable>
        )}
      </Animated.View>
    </GestureDetector>
  );
}
