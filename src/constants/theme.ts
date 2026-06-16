import { ViewStyle } from "react-native";

/**
 * Central design tokens. Use these hex values for places that cannot take
 * Tailwind classes (lucide icon `color`, gradient colours, animated styles).
 * The same palette is mirrored as semantic tokens in tailwind.config.js.
 */
export const theme = {
  color: {
    primary: "#2F7D62",
    primaryLight: "#6AB99D",
    mint: "#EAF7F1",
    cream: "#FFF8E8",
    foreground: "#1F2933",
    muted: "#6B7280",
    mutedSurface: "#F3F4F6",
    border: "#E5E7EB",
    background: "#F7F8FA",
    card: "#FFFFFF",
    white: "#FFFFFF",
    success: "#22C55E",
    successDark: "#065F46",
    successSurface: "#D1FAE5",
    warning: "#FBBF24",
    warningDark: "#D97706",
    warningSurface: "#FEF3C7",
    destructive: "#EF4444",
    destructiveSurface: "#FEE2E2",
    info: "#7C3AED",
    infoSurface: "#EDE9FE",
    orange: "#FB923C",
  },
};

/** Soft, consistent elevation presets (shadcn-like subtle depth). */
export const shadow: Record<"sm" | "md" | "lg", ViewStyle> = {
  sm: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
