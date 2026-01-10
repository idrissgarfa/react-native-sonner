import React, { createContext, useContext } from "react";
import type { Position, SwipeDirection, ToastIcons, ToastStyles } from "./types";

export interface ToasterContextValue {
  position: Position;
  theme: "light" | "dark";
  gap: number;
  swipeToDismiss: boolean;
  swipeDirection: SwipeDirection[];
  richColors: boolean;
  closeButton: boolean;
  icons?: ToastIcons;
  toastStyles?: ToastStyles;
}

const ToasterContext = createContext<ToasterContextValue | null>(null);

export function ToasterProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ToasterContextValue;
}) {
  return <ToasterContext.Provider value={value}>{children}</ToasterContext.Provider>;
}

export function useToasterContext(): ToasterContextValue {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error("useToasterContext must be used within a ToasterProvider");
  }
  return context;
}

export function useToasterContextOptional(): ToasterContextValue | null {
  return useContext(ToasterContext);
}
