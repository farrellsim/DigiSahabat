import { View } from "react-native";

/** Thin rounded progress track + fill. */
export function ProgressBar({
  value,
  height = 8,
  trackColor = "#F1F3F5",
  fillColor = "#6AB99D",
}: {
  value: number; // 0-100
  height?: number;
  trackColor?: string;
  fillColor?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View
      className="w-full rounded-full overflow-hidden"
      style={{ height, backgroundColor: trackColor }}
    >
      <View
        className="rounded-full"
        style={{ height, width: `${pct}%`, backgroundColor: fillColor }}
      />
    </View>
  );
}
