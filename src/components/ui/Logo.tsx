import { Image, ImageStyle, StyleProp } from "react-native";

const SOURCES = {
  default: require("../../../assets/images/logo.png"),
  mono: require("../../../assets/images/logo-mono.png"),
};

type LogoProps = {
  size?: number;
  variant?: keyof typeof SOURCES;
  style?: StyleProp<ImageStyle>;
};

/** App brand mark. Swap assets/images/logo.png with the real art any time. */
export function Logo({ size = 64, variant = "default", style }: LogoProps) {
  return (
    <Image
      source={SOURCES[variant]}
      accessibilityRole="image"
      accessibilityLabel="DigiSahabat logo"
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    />
  );
}
