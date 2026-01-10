import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import type { ToastType } from "./types";

// Try to import react-native-svg, fall back to simple views if not available
let Svg: typeof import("react-native-svg").default | null = null;
let Circle: typeof import("react-native-svg").Circle | null = null;
let Path: typeof import("react-native-svg").Path | null = null;

try {
  const svg = require("react-native-svg");
  Svg = svg.default || svg.Svg;
  Circle = svg.Circle;
  Path = svg.Path;
} catch {
  // react-native-svg not installed, will use fallback icons
}

interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 20;

export function SuccessIcon({ size = DEFAULT_SIZE, color = "#22c55e" }: IconProps) {
  if (Svg && Circle && Path) {
    return (
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" />
        <Path
          d="M6 10.5L8.5 13L14 7"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }

  return (
    <View style={[styles.fallbackIcon, { width: size, height: size, borderColor: color }]}>
      <View style={[styles.checkmark, { borderColor: color }]} />
    </View>
  );
}

export function ErrorIcon({ size = DEFAULT_SIZE, color = "#ef4444" }: IconProps) {
  if (Svg && Circle && Path) {
    return (
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" />
        <Path
          d="M7 7L13 13M13 7L7 13"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <View style={[styles.fallbackIcon, { width: size, height: size, borderColor: color }]}>
      <View style={[styles.xMark, { backgroundColor: color }]} />
      <View style={[styles.xMark, styles.xMarkRotated, { backgroundColor: color }]} />
    </View>
  );
}

export function WarningIcon({ size = DEFAULT_SIZE, color = "#f59e0b" }: IconProps) {
  if (Svg && Path && Circle) {
    return (
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Path
          d="M10 2L19 18H1L10 2Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <Path
          d="M10 8V11"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Circle cx="10" cy="14" r="0.75" fill={color} />
      </Svg>
    );
  }

  return (
    <View style={[styles.triangleContainer, { width: size, height: size }]}>
      <View style={[styles.triangle, { borderBottomColor: color }]} />
    </View>
  );
}

export function InfoIcon({ size = DEFAULT_SIZE, color = "#3b82f6" }: IconProps) {
  if (Svg && Circle && Path) {
    return (
      <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <Circle cx="10" cy="10" r="9" stroke={color} strokeWidth="1.5" />
        <Path
          d="M10 9V14"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Circle cx="10" cy="6.5" r="0.75" fill={color} />
      </Svg>
    );
  }

  return (
    <View style={[styles.fallbackIcon, { width: size, height: size, borderColor: color }]}>
      <View style={[styles.infoLine, { backgroundColor: color }]} />
      <View style={[styles.infoDot, { backgroundColor: color }]} />
    </View>
  );
}

export function LoadingIcon({ size = DEFAULT_SIZE, color = "#6b7280" }: IconProps) {
  return <ActivityIndicator size="small" color={color} style={{ width: size, height: size }} />;
}

export function CloseIcon({ size = 12, color = "#9ca3af" }: IconProps) {
  if (Svg && Path) {
    return (
      <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
        <Path
          d="M2 2L10 10M10 2L2 10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <View style={[styles.closeX, { backgroundColor: color }]} />
      <View style={[styles.closeX, styles.closeXRotated, { backgroundColor: color }]} />
    </View>
  );
}

export function getIcon(type: ToastType, color?: string): React.ReactNode {
  switch (type) {
    case "success":
      return <SuccessIcon color={color} />;
    case "error":
      return <ErrorIcon color={color} />;
    case "warning":
      return <WarningIcon color={color} />;
    case "info":
      return <InfoIcon color={color} />;
    case "loading":
      return <LoadingIcon color={color} />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  fallbackIcon: {
    borderWidth: 1.5,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    width: 6,
    height: 10,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: "45deg" }, { translateY: -1 }],
  },
  xMark: {
    position: "absolute",
    width: 8,
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
  },
  xMarkRotated: {
    transform: [{ rotate: "-45deg" }],
  },
  triangleContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  infoLine: {
    width: 1.5,
    height: 6,
    borderRadius: 1,
    marginTop: 2,
  },
  infoDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    position: "absolute",
    top: 4,
  },
  closeX: {
    position: "absolute",
    width: 10,
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }],
  },
  closeXRotated: {
    transform: [{ rotate: "-45deg" }],
  },
});
