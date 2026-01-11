import React, { useCallback, useMemo } from "react";
import { AccessibilityInfo, Platform, StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ANIMATION_DEFAULTS, toastDefaults } from "./constants";
import { ToastState } from "./state";
import { resolveTheme } from "./theme";
import { Toast } from "./toast";
import type { AnimationConfig, Position, SwipeDirection, ToasterProps, ToastT } from "./types";
import { useToastState } from "./use-toast-state";

interface Offset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function getContainerStyle(position: Position, offset: Offset) {
  const isTop = position.startsWith("top");
  const isBottom = position.startsWith("bottom");

  const style: Record<string, number | string> = {
    position: "absolute",
    left: offset.left,
    right: offset.right,
    flexDirection: "column",
  };

  if (isTop) {
    style.top = offset.top;
  } else if (isBottom) {
    style.bottom = offset.bottom;
    style.flexDirection = "column-reverse";
  }

  if (position.includes("left")) {
    style.alignItems = "flex-start";
  } else if (position.includes("right")) {
    style.alignItems = "flex-end";
  } else {
    style.alignItems = "center";
  }

  return style;
}

function announceForAccessibility(toast: ToastT): void {
  if (toast.accessibility?.announceToScreenReader === false) {
    return;
  }

  const message = toast.accessibility?.accessibilityLabel
    ?? (typeof toast.title === "string" ? toast.title : "Notification");

  if (Platform.OS === "ios" || Platform.OS === "android") {
    AccessibilityInfo.announceForAccessibility(message);
  }
}

export function Toaster({
  position = toastDefaults.position,
  theme = toastDefaults.theme,
  duration = toastDefaults.duration,
  gap = toastDefaults.gap,
  offset: customOffset,
  swipeToDismiss = toastDefaults.swipeToDismiss,
  swipeDirection = toastDefaults.swipeDirection,
  pauseOnAppBackground = toastDefaults.pauseOnAppBackground,
  visibleToasts = toastDefaults.visibleToasts,
  icons,
  toastStyles,
  variantStyles,
  containerStyle,
  richColors = toastDefaults.richColors,
  closeButton = toastDefaults.closeButton,
  toasterId,
  animation,
  hapticFeedback = toastDefaults.hapticFeedback,
}: ToasterProps) {
  const insets = useSafeAreaInsets();
  const { toasts } = useToastState();

  const resolvedTheme = resolveTheme(theme);

  // Merge animation config with defaults
  const mergedAnimation: Required<AnimationConfig> = useMemo(() => ({
    ...ANIMATION_DEFAULTS,
    ...animation,
  }), [animation]);

  const offset = useMemo(() => {
    const base = { ...toastDefaults.offset, ...customOffset };
    return {
      top: base.top + insets.top,
      bottom: base.bottom + insets.bottom,
      left: base.left + insets.left,
      right: base.right + insets.right,
    };
  }, [customOffset, insets]);

  const normalizedSwipeDirection: SwipeDirection[] = useMemo(() => {
    return Array.isArray(swipeDirection) ? swipeDirection : [swipeDirection];
  }, [swipeDirection]);

  // Filter toasts by toasterId if provided
  const filteredToasts = useMemo(() => {
    if (!toasterId) {
      return toasts;
    }
    // Only show toasts that match this toasterId or have no toasterId set
    return toasts.filter((t) => t.toasterId === toasterId || t.toasterId === undefined);
  }, [toasts, toasterId]);

  // Sort toasts: newest first for top position, oldest first for bottom
  // This ensures newest toast appears at the edge (top or bottom)
  const sortedToasts = useMemo(() => {
    const sorted = [...filteredToasts].sort((a, b) => b.createdAt - a.createdAt);
    // For top: newest first (appears at top, older ones below)
    // For bottom: reverse so newest appears at bottom edge
    return position.startsWith("bottom") ? sorted.reverse() : sorted;
  }, [filteredToasts, position]);

  // Enforce visibleToasts limit - show only the most recent N toasts
  // Important toasts are always shown
  const visibleToastList = useMemo(() => {
    if (visibleToasts <= 0) {
      return sortedToasts;
    }

    // Separate important and regular toasts
    const important = sortedToasts.filter((t) => t.important);
    const regular = sortedToasts.filter((t) => !t.important);

    // Show all important toasts plus fill remaining slots with regular toasts
    const remainingSlots = Math.max(0, visibleToasts - important.length);
    const visibleRegular = regular.slice(0, remainingSlots);

    // Combine and maintain sort order
    const combined = [...important, ...visibleRegular];
    return combined.sort((a, b) => {
      const aIndex = sortedToasts.indexOf(a);
      const bIndex = sortedToasts.indexOf(b);
      return aIndex - bIndex;
    });
  }, [sortedToasts, visibleToasts]);

  const handleDismiss = useCallback((toastId: string | number) => {
    const toast = toasts.find((t) => t.id === toastId);
    if (toast) {
      toast.onDismiss?.(toast);
    }
    ToastState.dismiss(toastId);
  }, [toasts]);

  // Announce new toasts for accessibility
  const announcedRef = React.useRef<Set<string | number>>(new Set());
  React.useEffect(() => {
    for (const toast of visibleToastList) {
      if (!announcedRef.current.has(toast.id)) {
        announcedRef.current.add(toast.id);
        announceForAccessibility(toast);
      }
    }
    // Clean up old IDs
    const currentIds = new Set(visibleToastList.map((t) => t.id));
    announcedRef.current.forEach((id) => {
      if (!currentIds.has(id)) {
        announcedRef.current.delete(id);
      }
    });
  }, [visibleToastList]);

  if (visibleToastList.length === 0) {
    return null;
  }

  const positionStyle = getContainerStyle(position, offset);

  // Build container style using spread
  const finalContainerStyle: ViewStyle = {
    ...styles.container,
    ...positionStyle,
    ...(containerStyle as ViewStyle),
  };

  return (
    <View
      style={finalContainerStyle}
      pointerEvents="box-none"
      accessible={true}
      accessibilityLabel="Notifications"
    >
      {visibleToastList.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          position={position}
          gap={gap}
          swipeToDismiss={swipeToDismiss}
          swipeDirection={normalizedSwipeDirection}
          theme={resolvedTheme}
          richColors={richColors}
          closeButton={closeButton}
          icons={icons}
          defaultStyles={toastStyles}
          variantStyles={variantStyles}
          defaultAnimation={mergedAnimation}
          onDismiss={handleDismiss}
          duration={duration}
          pauseOnAppBackground={pauseOnAppBackground}
          hapticFeedback={hapticFeedback}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 9999,
    pointerEvents: "box-none",
  },
});
