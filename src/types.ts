import type { ReactNode } from "react";
import type { AccessibilityRole, StyleProp, TextStyle, ViewStyle } from "react-native";

/**
 * Toast variant types
 */
export type ToastType =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

/**
 * Position of the toast on screen
 */
export type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/**
 * Swipe direction to dismiss
 */
export type SwipeDirection = "left" | "right" | "up" | "down";

/**
 * Theme options
 */
export type Theme = "light" | "dark" | "system";

/**
 * Resolved theme (without system)
 */
export type ResolvedTheme = "light" | "dark";

/**
 * Action button configuration
 */
export interface Action {
  label: string;
  onClick: (toast: ToastT) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

/**
 * Promise data for toast.promise()
 */
export interface PromiseData<T = unknown> {
  loading: string | ReactNode;
  success: string | ReactNode | ((data: T) => string | ReactNode);
  error: string | ReactNode | ((error: unknown) => string | ReactNode);
  finally?: () => void;
}

/**
 * Custom icons for toast types
 */
export interface ToastIcons {
  success?: ReactNode;
  error?: ReactNode;
  warning?: ReactNode;
  info?: ReactNode;
  loading?: ReactNode;
}

/**
 * Custom styles for toast parts
 */
export interface ToastStyles {
  container?: StyleProp<ViewStyle>;
  content?: StyleProp<ViewStyle>;
  title?: StyleProp<TextStyle>;
  description?: StyleProp<TextStyle>;
  actionButton?: StyleProp<ViewStyle>;
  actionButtonText?: StyleProp<TextStyle>;
  cancelButton?: StyleProp<ViewStyle>;
  cancelButtonText?: StyleProp<TextStyle>;
  closeButton?: StyleProp<ViewStyle>;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  /** Entry animation duration in ms @default 350 */
  duration?: number;
  /** Exit animation duration in ms @default 200 */
  exitDuration?: number;
  /** Use spring animation for entry @default true */
  useSpring?: boolean;
  /** Spring damping @default 18 */
  damping?: number;
  /** Spring stiffness @default 140 */
  stiffness?: number;
  /** Spring mass @default 1 */
  mass?: number;
}

/**
 * Accessibility configuration
 */
export interface AccessibilityConfig {
  /** Accessibility role @default "alert" */
  role?: AccessibilityRole;
  /** Whether to announce toast to screen readers @default true */
  announceToScreenReader?: boolean;
  /** Custom accessibility label */
  accessibilityLabel?: string;
}

/**
 * Internal toast data structure
 */
export interface ToastT {
  id: string | number;
  type: ToastType;
  title: string | ReactNode;
  description?: string | ReactNode;
  icon?: ReactNode;
  duration?: number;
  dismissible?: boolean;
  action?: Action;
  cancel?: Action;
  onDismiss?: (toast: ToastT) => void;
  onAutoClose?: (toast: ToastT) => void;
  styles?: ToastStyles;
  /** Mark toast as important (won't be auto-dismissed when queue is full) */
  important?: boolean;
  /** Toaster ID to target specific Toaster instance */
  toasterId?: string;
  /** Internal: timestamp when created */
  createdAt: number;
  /** Internal: whether this toast is being dismissed */
  dismissed?: boolean;
  /** Animation configuration for this toast */
  animation?: AnimationConfig;
  /** Accessibility configuration */
  accessibility?: AccessibilityConfig;
}

/**
 * Options for updating a toast
 */
export type UpdateToastOptions = Partial<Omit<ToastT, "id" | "createdAt">>;

/**
 * External toast options (what users pass to toast())
 */
export type ExternalToast = Omit<ToastT, "id" | "type" | "title" | "createdAt"> & {
  /** Optional custom ID for the toast */
  id?: string | number;
};

/**
 * Toast height tracking for stacking
 */
export interface HeightT {
  toastId: string | number;
  height: number;
}

/**
 * Toaster component props
 */
export interface ToasterProps {
  /**
   * Position of toasts on screen
   * @default "top-center"
   */
  position?: Position;

  /**
   * Theme for toasts
   * @default "system"
   */
  theme?: Theme;

  /**
   * Maximum number of visible toasts (excess queued)
   * @default 5
   */
  visibleToasts?: number;

  /**
   * Default duration in milliseconds
   * @default 3000
   */
  duration?: number;

  /**
   * Gap between toasts in pixels
   * @default 12
   */
  gap?: number;

  /**
   * Offset from screen edges
   * @default { top: 52, bottom: 52, left: 16, right: 16 }
   */
  offset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };

  /**
   * Enable swipe to dismiss
   * @default true
   */
  swipeToDismiss?: boolean;

  /**
   * Swipe direction(s) to dismiss
   * @default ["left", "right"]
   */
  swipeDirection?: SwipeDirection | SwipeDirection[];

  /**
   * Pause toast timer when app is in background
   * @default true
   */
  pauseOnAppBackground?: boolean;

  /**
   * Custom icons for toast types
   */
  icons?: ToastIcons;

  /**
   * Default styles for all toasts
   */
  toastStyles?: ToastStyles;

  /**
   * Custom container style
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Rich colors mode (more vibrant backgrounds)
   * @default false
   */
  richColors?: boolean;

  /**
   * Close button on toasts
   * @default false
   */
  closeButton?: boolean;

  /**
   * Only show toasts with matching toasterId
   */
  toasterId?: string;

  /**
   * Default animation configuration
   */
  animation?: AnimationConfig;

  /**
   * Enable haptic feedback on toast actions
   * @default false
   */
  hapticFeedback?: boolean;
}

/**
 * Individual toast component props (internal)
 */
export interface ToastProps {
  toast: ToastT;
  position: Position;
  gap: number;
  swipeToDismiss: boolean;
  swipeDirection: SwipeDirection[];
  theme: ResolvedTheme;
  richColors: boolean;
  closeButton: boolean;
  icons?: ToastIcons;
  defaultStyles?: ToastStyles;
  defaultAnimation?: AnimationConfig;
  onDismiss: (toastId: string | number) => void;
  /** Default duration for auto-dismiss */
  duration: number;
  /** Pause timer when app goes to background */
  pauseOnAppBackground: boolean;
  hapticFeedback?: boolean;
}

/**
 * Toast state subscriber callback
 */
export type ToastStateSubscriber = (toast: ToastT) => void;

/**
 * Toast dismiss subscriber callback
 */
export type ToastDismissSubscriber = (toastId: string | number | undefined) => void;

/**
 * Toast update subscriber callback
 */
export type ToastUpdateSubscriber = (toast: ToastT) => void;
