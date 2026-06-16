import { View, ViewProps } from "react-native";
import { shadow } from "../../constants/theme";

type CardProps = ViewProps & {
  /** Visual elevation. Defaults to "md". Use "none" for a flat bordered card. */
  elevation?: "none" | "sm" | "md" | "lg";
};

/**
 * A clean white surface with a hairline border and soft shadow —
 * the base building block for the whole UI (shadcn `Card` equivalent).
 */
export function Card({
  elevation = "md",
  style,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      className={`rounded-3xl bg-card border border-border ${className ?? ""}`}
      style={[elevation !== "none" ? shadow[elevation] : null, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
