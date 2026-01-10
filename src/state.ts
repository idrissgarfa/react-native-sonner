import type { ReactNode } from "react";
import {
  DISMISSED_CACHE_CLEANUP_THRESHOLD,
  DISMISSED_CACHE_MAX_SIZE,
} from "./constants";
import type {
  ExternalToast,
  PromiseData,
  ToastDismissSubscriber,
  ToastStateSubscriber,
  ToastT,
  ToastType,
  ToastUpdateSubscriber,
  UpdateToastOptions,
} from "./types";

let toastCount = 0;

function generateId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return `sonner-${toastCount}-${Date.now()}`;
}

class ToastStateManager {
  private toasts: ToastT[] = [];
  private subscribers: Set<ToastStateSubscriber> = new Set();
  private dismissSubscribers: Set<ToastDismissSubscriber> = new Set();
  private updateSubscribers: Set<ToastUpdateSubscriber> = new Set();
  private dismissedToasts: Map<string | number, number> = new Map();

  subscribe(callback: ToastStateSubscriber): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  subscribeToDismiss(callback: ToastDismissSubscriber): () => void {
    this.dismissSubscribers.add(callback);
    return () => this.dismissSubscribers.delete(callback);
  }

  subscribeToUpdate(callback: ToastUpdateSubscriber): () => void {
    this.updateSubscribers.add(callback);
    return () => this.updateSubscribers.delete(callback);
  }

  private publish(toast: ToastT): void {
    this.subscribers.forEach((subscriber) => subscriber(toast));
  }

  private publishDismiss(toastId: string | number | undefined): void {
    this.dismissSubscribers.forEach((subscriber) => subscriber(toastId));
  }

  private publishUpdate(toast: ToastT): void {
    this.updateSubscribers.forEach((subscriber) => subscriber(toast));
  }

  private cleanupDismissedCache(): void {
    if (this.dismissedToasts.size <= DISMISSED_CACHE_MAX_SIZE) {
      return;
    }

    // Sort by timestamp (oldest first) and remove oldest entries
    const entries = Array.from(this.dismissedToasts.entries());
    entries.sort((a, b) => a[1] - b[1]);

    const toRemove = entries.slice(0, DISMISSED_CACHE_CLEANUP_THRESHOLD);
    toRemove.forEach(([id]) => this.dismissedToasts.delete(id));
  }

  create(
    title: string | ReactNode,
    type: ToastType = "default",
    options?: ExternalToast
  ): string | number {
    const id = options?.id ?? generateId();

    // Skip if this toast was recently dismissed (prevents re-creation loops)
    if (this.dismissedToasts.has(id)) {
      return id;
    }

    const toast: ToastT = {
      ...options,
      id,
      type,
      title,
      createdAt: Date.now(),
    };

    // Update existing toast or add new one
    const existingIndex = this.toasts.findIndex((t) => t.id === id);
    if (existingIndex > -1) {
      this.toasts[existingIndex] = toast;
      this.publishUpdate(toast);
    } else {
      this.toasts.push(toast);
      this.publish(toast);
    }

    return id;
  }

  update(toastId: string | number, options: UpdateToastOptions): boolean {
    const index = this.toasts.findIndex((t) => t.id === toastId);
    if (index === -1) {
      return false;
    }

    const existingToast = this.toasts[index]!;
    const updatedToast: ToastT = {
      ...existingToast,
      ...options,
      id: toastId, // Ensure ID isn't changed
      type: options.type ?? existingToast.type, // Ensure type is always defined
      title: options.title ?? existingToast.title, // Ensure title is always defined
      createdAt: existingToast.createdAt, // Preserve original timestamp
    };

    this.toasts[index] = updatedToast;
    this.publishUpdate(updatedToast);
    return true;
  }

  dismiss(toastId?: string | number): void {
    const now = Date.now();

    if (toastId === undefined) {
      for (const toast of this.toasts) {
        this.dismissedToasts.set(toast.id, now);
        toast.onDismiss?.(toast);
      }
      this.toasts = [];
    } else {
      const toast = this.toasts.find((t) => t.id === toastId);
      if (toast) {
        toast.onDismiss?.(toast);
      }
      this.dismissedToasts.set(toastId, now);
      this.toasts = this.toasts.filter((t) => t.id !== toastId);
    }

    this.publishDismiss(toastId);
    this.cleanupDismissedCache();
  }

  getToasts(): ToastT[] {
    return [...this.toasts];
  }

  getToast(toastId: string | number): ToastT | undefined {
    return this.toasts.find((t) => t.id === toastId);
  }

  isActive(toastId: string | number): boolean {
    return this.toasts.some((t) => t.id === toastId);
  }

  async promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    data: PromiseData<T>,
    options?: ExternalToast
  ): Promise<T> {
    const id = this.create(data.loading, "loading", {
      ...options,
      duration: Number.POSITIVE_INFINITY,
      dismissible: false,
    });

    const promiseToExecute = typeof promise === "function" ? promise() : promise;

    try {
      const result = await promiseToExecute;
      const successMessage =
        typeof data.success === "function" ? data.success(result) : data.success;

      this.update(id, {
        type: "success",
        title: successMessage,
        dismissible: true,
        duration: options?.duration,
      });

      return result;
    } catch (error) {
      const errorMessage =
        typeof data.error === "function" ? data.error(error) : data.error;

      this.update(id, {
        type: "error",
        title: errorMessage,
        dismissible: true,
        duration: options?.duration,
      });

      throw error;
    } finally {
      data.finally?.();
    }
  }

  clearDismissedHistory(): void {
    this.dismissedToasts.clear();
  }
}

export const ToastState = new ToastStateManager();

function createToast(type: ToastType) {
  return (title: string | ReactNode, options?: ExternalToast) =>
    ToastState.create(title, type, options);
}

/**
 * Main toast API
 *
 * @example
 * // Basic usage
 * toast('Hello World');
 *
 * // With variants
 * toast.success('Success!');
 * toast.error('Error!');
 *
 * // With options
 * toast('Message', { duration: 5000 });
 *
 * // Update existing toast
 * const id = toast.loading('Loading...');
 * toast.update(id, { title: 'Done!', type: 'success' });
 *
 * // Promise toast
 * toast.promise(fetchData(), {
 *   loading: 'Loading...',
 *   success: 'Loaded!',
 *   error: 'Failed',
 * });
 */
export const toast = Object.assign(
  (title: string | ReactNode, options?: ExternalToast) =>
    ToastState.create(title, "default", options),
  {
    success: createToast("success"),
    error: createToast("error"),
    warning: createToast("warning"),
    info: createToast("info"),
    loading: createToast("loading"),
    promise: <T>(
      promise: Promise<T> | (() => Promise<T>),
      data: PromiseData<T>,
      options?: ExternalToast
    ) => ToastState.promise(promise, data, options),
    update: (toastId: string | number, options: UpdateToastOptions) =>
      ToastState.update(toastId, options),
    dismiss: (toastId?: string | number) => ToastState.dismiss(toastId),
    getToasts: () => ToastState.getToasts(),
    getToast: (toastId: string | number) => ToastState.getToast(toastId),
    isActive: (toastId: string | number) => ToastState.isActive(toastId),
    custom: (title: string | ReactNode, options?: ExternalToast) =>
      ToastState.create(title, "default", options),
  }
);
