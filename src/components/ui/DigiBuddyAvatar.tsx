import { Image, ImageStyle, StyleProp } from "react-native";

const SRC = require("../../../assets/images/digibuddy.png");

type Props = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

/** DigiBuddy character avatar. Swap assets/images/digibuddy.png with real art. */
export function DigiBuddyAvatar({ size = 40, style }: Props) {
  return (
    <Image
      source={SRC}
      accessibilityRole="image"
      accessibilityLabel="DigiBuddy"
      style={[{ width: size, height: size, resizeMode: "contain" }, style]}
    />
  );
}
