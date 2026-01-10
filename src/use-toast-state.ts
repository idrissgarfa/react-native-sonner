import { useCallback, useEffect, useRef, useState } from "react";
import { ToastState } from "./state";
import type { ToastT } from "./types";

export function useToastState() {
  const [toasts, setToasts] = useState<ToastT[]>(() => ToastState.getToasts());
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  useEffect(() => {
    const unsubscribeCreate = ToastState.subscribe(() => {
      setToasts(ToastState.getToasts());
    });

    const unsubscribeDismiss = ToastState.subscribeToDismiss(() => {
      setToasts(ToastState.getToasts());
    });

    const unsubscribeUpdate = ToastState.subscribeToUpdate(() => {
      setToasts(ToastState.getToasts());
    });

    return () => {
      unsubscribeCreate();
      unsubscribeDismiss();
      unsubscribeUpdate();
    };
  }, []);

  const getToast = useCallback((id: string | number) => {
    return toastsRef.current.find((t) => t.id === id);
  }, []);

  const isActive = useCallback((id: string | number) => {
    return toastsRef.current.some((t) => t.id === id);
  }, []);

  return {
    toasts,
    getToast,
    isActive,
  };
}
