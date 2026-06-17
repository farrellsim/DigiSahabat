import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";
import { theme } from "../constants/theme";
import { Logo } from "./ui/Logo";

/**
 * Branded loading screen shown while the app boots / restores the session.
 * Deep-green brand backdrop, logo card lift-in, and a calm pulsing loader.
 */
export function AppSplash() {
  const fade = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 550, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      Animated.timing(lift, { toValue: 0, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [fade, lift, scale, pulse]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.color.primary, alignItems: "center", justifyContent: "center" }}>
      {/* soft glow */}
      <View
        style={{
          position: "absolute",
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: theme.color.primaryLight,
          opacity: 0.18,
        }}
      />

      <Animated.View style={{ opacity: fade, transform: [{ translateY: lift }, { scale }], alignItems: "center" }}>
        {/* Deep-green app-icon tile so the light monochrome mark reads clearly */}
        <View
          style={{
            width: 156,
            height: 156,
            borderRadius: 44,
            backgroundColor: "#0E5238",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOpacity: 0.25,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 14 },
            elevation: 10,
          }}
        >
          <Logo size={108} />
        </View>

        <Animated.Text
          style={{ marginTop: 28, fontSize: 30, fontWeight: "800", color: "#fff", letterSpacing: 0.3 }}
        >
          DigiSahabat
        </Animated.Text>
        <Animated.Text style={{ marginTop: 10, fontSize: 16, color: "rgba(255,255,255,0.82)", fontWeight: "500" }}>
          Belajar digital, langkah demi langkah
        </Animated.Text>
      </Animated.View>

      {/* pulsing loader dots */}
      <Animated.View
        style={{ position: "absolute", bottom: 72, flexDirection: "row", opacity: pulse }}
      >
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={{ width: 9, height: 9, borderRadius: 5, marginHorizontal: 4, backgroundColor: "#fff" }}
          />
        ))}
      </Animated.View>
    </View>
  );
}
