import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { theme } from "../../constants/theme";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
};

const sizeMap: Record<Size, { py: string; text: string; icon: number }> = {
  sm: { py: "py-2.5", text: "text-[14px]", icon: 16 },
  md: { py: "py-3.5", text: "text-[15px]", icon: 18 },
  lg: { py: "py-4", text: "text-[16px]", icon: 20 },
};

/** Primary/secondary/ghost button with optional lucide icons (shadcn `Button`). */
export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  disabled,
  loading,
  fullWidth = true,
  className,
}: ButtonProps) {
  const s = sizeMap[size];
  const isDisabled = disabled || loading;

  const surface =
    variant === "primary"
      ? "bg-primary"
      : variant === "destructive"
        ? "bg-destructive"
        : variant === "secondary"
          ? "bg-card border border-border"
          : "bg-transparent";

  const textColor =
    variant === "secondary"
      ? theme.color.foreground
      : variant === "ghost"
        ? theme.color.primary
        : theme.color.white;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      className={`rounded-2xl items-center justify-center ${surface} ${s.py} ${
        fullWidth ? "w-full" : "px-5 self-start"
      } ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
    >
      <View className="flex-row items-center justify-center">
        {loading ? (
          <ActivityIndicator size="small" color={textColor} />
        ) : (
          <>
            {Icon ? (
              <Icon size={s.icon} color={textColor} style={{ marginRight: 8 }} />
            ) : null}
            <Text className={`font-bold ${s.text}`} style={{ color: textColor }}>
              {label}
            </Text>
            {IconRight ? (
              <IconRight
                size={s.icon}
                color={textColor}
                style={{ marginLeft: 8 }}
              />
            ) : null}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
