import { Text, View } from "react-native";
import { LucideIcon } from "lucide-react-native";

type Tone = "primary" | "muted" | "success" | "warning" | "info";

const toneMap: Record<Tone, { bg: string; text: string; icon: string }> = {
  primary: { bg: "#EAF7F1", text: "#2F7D62", icon: "#2F7D62" },
  muted: { bg: "#F3F4F6", text: "#6B7280", icon: "#6B7280" },
  success: { bg: "#D1FAE5", text: "#065F46", icon: "#065F46" },
  warning: { bg: "#FEF3C7", text: "#92400E", icon: "#D97706" },
  info: { bg: "#EDE9FE", text: "#5B21B6", icon: "#7C3AED" },
};

/** Small rounded status/label chip (shadcn `Badge`). */
export function Pill({
  label,
  tone = "muted",
  icon: Icon,
}: {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
}) {
  const c = toneMap[tone];
  return (
    <View
      className="flex-row items-center rounded-full px-2.5 py-1"
      style={{ backgroundColor: c.bg }}
    >
      {Icon ? <Icon size={12} color={c.icon} style={{ marginRight: 4 }} /> : null}
      <Text className="text-[11px] font-bold" style={{ color: c.text }}>
        {label}
      </Text>
    </View>
  );
}
