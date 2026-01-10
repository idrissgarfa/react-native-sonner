import type { AnimationConfig, Position, SwipeDirection, Theme } from "./types";

export const ANIMATION_DEFAULTS: Required<AnimationConfig> = {
  duration: 350,
  exitDuration: 200,
  useSpring: true,
  damping: 18,
  stiffness: 140,
  mass: 1,
} as const;

export const ENTRY_OFFSET = 40;

export const SWIPE_THRESHOLD = 60;
export const VELOCITY_THRESHOLD = 500;
export const DAMPING_FACTOR = 0.5;
export const SWIPE_EXIT_DISTANCE = 300;
export const SNAP_BACK_DURATION = 150;

export const DEFAULT_ICON_SIZE = 20;

export const DISMISSED_CACHE_MAX_SIZE = 100;
export const DISMISSED_CACHE_CLEANUP_THRESHOLD = 50;

export const toastDefaults = {
  duration: 3000,
  position: "top-center" as Position,
  gap: 12,
  offset: {
    top: 52,
    bottom: 52,
    left: 16,
    right: 16,
  },
  swipeToDismiss: true,
  swipeDirection: ["left", "right"] as SwipeDirection[],
  theme: "system" as Theme,
  richColors: false,
  closeButton: false,
  dismissible: true,
  pauseOnAppBackground: true,
  visibleToasts: 5,
  hapticFeedback: false,
} as const;
