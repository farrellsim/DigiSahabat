import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { setSession } from "../../lib/protoSession";
import { useAppStore } from "../../src/store/app.store";
import { Logo } from "../../src/components/ui/Logo";

export default function Login() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithPin = useAppStore((s) => s.loginWithPin);
  const loginAsGuest = useAppStore((s) => s.loginAsGuest);

  const canLogin = useMemo(
    () => username.trim().length >= 3 && pin.length === 6,
    [username, pin]
  );

  const login = async () => {
    if (!canLogin || loading) return;
    setLoading(true);
    setError(null);
    try {
      await useAppStore.getState().loginWithPin?.(username.trim(), pin);
      // backend login worked (or threw)
      const ok = !!useAppStore.getState().token;
      if (!ok) throw new Error("no token");
      await setSession({ isAuthed: true, username: username.trim() });
      router.replace("/(tabs)/home");
    } catch (e: any) {
      const status = e?.status;
      if (status === 401) {
        setError("Wrong username or PIN. Try again.");
      } else {
        setError("Could not reach the server. You can continue as guest.");
      }
    } finally {
      setLoading(false);
    }
  };

  const guest = async () => {
    loginAsGuest();
    await setSession({ isAuthed: true, username: "auntylela" });
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <View className="w-[92px] h-[92px] rounded-3xl bg-primary items-center justify-center shadow-sm">
            <Logo size={62} />
          </View>
        </View>

        <Text className="text-[30px] font-extrabold text-gray-900 text-center">
          Welcome back
        </Text>
        <Text className="text-[16px] text-gray-500 mt-2 mb-7 text-center leading-6">
          Continue your digital learning journey
        </Text>

        <View className="flex-row gap-3 mb-7">
          {["Interactive", "Safe", "Fast"].map((t) => (
            <View
              key={t}
              className="flex-1 rounded-2xl bg-green-50 border border-green-100 py-3.5 items-center"
            >
              <Text className="text-[14px] font-semibold text-green-800">{t}</Text>
            </View>
          ))}
        </View>

        <Text className="text-[15px] font-semibold text-gray-700 mb-2">Username</Text>
        <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl px-4 py-4 mb-4">
          <Ionicons name="person-outline" size={22} color="#4B5563" />
          <TextInput
            value={username}
            onChangeText={(t) => {
              setUsername(t);
              setError(null);
            }}
            placeholder="Enter your username"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            className="ml-3 flex-1 text-[17px] text-gray-900"
          />
        </View>

        <Text className="text-[15px] font-semibold text-gray-700 mb-2">6-digit PIN</Text>
        <View className="flex-row items-center bg-white border-2 border-gray-200 rounded-2xl px-4 py-4">
          <Ionicons name="lock-closed-outline" size={22} color="#4B5563" />
          <TextInput
            value={pin}
            onChangeText={(t) => {
              setPin(t.replace(/\D/g, "").slice(0, 6));
              setError(null);
            }}
            placeholder="Enter 6-digit PIN"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            secureTextEntry
            className="ml-3 flex-1 text-[17px] text-gray-900"
          />
        </View>

        {error ? (
          <Text className="text-[14px] font-medium text-red-600 mt-3">{error}</Text>
        ) : (
          <Text className="text-[14px] text-gray-400 mt-3">
            Demo: auntylela / 123456
          </Text>
        )}

        <TouchableOpacity
          onPress={login}
          disabled={!canLogin || loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          className={[
            "mt-6 rounded-2xl items-center flex-row justify-center",
            canLogin && !loading ? "bg-green-600" : "bg-green-300",
          ].join(" ")}
          style={{ minHeight: 58 }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-[17px] font-bold">Log In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-pin")}
          className="mt-4 items-center py-2"
          accessibilityRole="button"
        >
          <Text className="text-[15px] text-green-700 font-semibold">
            Forgot PIN? Use phone OTP
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-5">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="mx-3 text-[13px] font-medium text-gray-400">OR</Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        <TouchableOpacity
          onPress={guest}
          activeOpacity={0.85}
          accessibilityRole="button"
          className="rounded-2xl border-2 border-gray-200 items-center justify-center bg-white"
          style={{ minHeight: 58 }}
        >
          <Text className="text-[17px] font-bold text-gray-900">
            Continue as Guest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          className="mt-6 items-center py-2"
          accessibilityRole="button"
        >
          <Text className="text-[15px] text-gray-500">
            Don’t have an account?{" "}
            <Text className="text-green-700 font-bold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
