import { Appearance, StyleSheet } from "react-native";
import type { Theme, ToastType } from "./types";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    const scheme = Appearance.getColorScheme();
    return scheme === "dark" ? "dark" : "light";
  }
  return theme;
}

export const colors = {
  light: {
    background: "#ffffff",
    foreground: "#0f172a",
    description: "#64748b",
    border: "#e2e8f0",
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
    loading: "#6b7280",
  },
  dark: {
    background: "#1e293b",
    foreground: "#f8fafc",
    description: "#94a3b8",
    border: "#334155",
    success: "#4ade80",
    error: "#f87171",
    warning: "#fbbf24",
    info: "#60a5fa",
    loading: "#9ca3af",
  },
} as const;

export const richColors = {
  light: {
    success: { background: "#dcfce7", foreground: "#166534", border: "#bbf7d0" },
    error: { background: "#fee2e2", foreground: "#991b1b", border: "#fecaca" },
    warning: { background: "#fef3c7", foreground: "#92400e", border: "#fde68a" },
    info: { background: "#dbeafe", foreground: "#1e40af", border: "#bfdbfe" },
  },
  dark: {
    success: { background: "#166534", foreground: "#dcfce7", border: "#22c55e" },
    error: { background: "#991b1b", foreground: "#fee2e2", border: "#ef4444" },
    warning: { background: "#92400e", foreground: "#fef3c7", border: "#f59e0b" },
    info: { background: "#1e40af", foreground: "#dbeafe", border: "#3b82f6" },
  },
} as const;

export function getIconColor(
  type: ToastType,
  theme: "light" | "dark",
  rich: boolean
): string {
  if (type === "default" || type === "loading") {
    return colors[theme].loading;
  }

  if (rich) {
    const richColor = richColors[theme][type as keyof typeof richColors.light];
    return richColor?.foreground ?? colors[theme][type];
  }

  return colors[theme][type];
}

export function getToastColors(
  type: ToastType,
  theme: "light" | "dark",
  rich: boolean
) {
  const baseColors = colors[theme];

  if (rich && type !== "default" && type !== "loading") {
    const richColor = richColors[theme][type as keyof typeof richColors.light];
    if (richColor) {
      return {
        background: richColor.background,
        foreground: richColor.foreground,
        description: richColor.foreground,
        border: richColor.border,
      };
    }
  }

  return {
    background: baseColors.background,
    foreground: baseColors.foreground,
    description: baseColors.description,
    border: baseColors.border,
  };
}

export const baseStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 52,
    maxWidth: "100%",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  contentNoIcon: {
    marginLeft: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#0f172a",
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ffffff",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 4,
  },
  iconContainer: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
