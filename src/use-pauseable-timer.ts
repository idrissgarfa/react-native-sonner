import { useEffect } from "react";
import { useAppState } from "./use-app-state";

export function usePauseableTimer(
  callback: () => void,
  duration: number,
  enabled: boolean,
  pauseOnBackground: boolean
): void {
  const appState = useAppState();

  useEffect(() => {
    if (!enabled || duration <= 0 || duration === Number.POSITIVE_INFINITY) {
      return;
    }

    if (pauseOnBackground && appState !== "active") {
      return;
    }

    const timer = setTimeout(callback, duration);
    return () => clearTimeout(timer);
  }, [callback, duration, enabled, pauseOnBackground, appState]);
}
