import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { setSession } from "../../lib/protoSession";

export default function Login() {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");

  const canLogin = useMemo(
    () => username.trim().length >= 3 && pin.length === 6,
    [username, pin]
  );

  const login = async () => {
    await setSession({
      isAuthed: true,
      username: username.trim(),
    });
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="w-16 h-16 rounded-2xl bg-green-100 items-center justify-center mb-6">
          <Text className="text-[22px]">📖</Text>
        </View>

        <Text className="text-[26px] font-semibold text-gray-900">Log In</Text>
        <Text className="text-[13px] text-gray-500 mt-2 mb-6">
          Continue your digital learning journey
        </Text>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 rounded-2xl bg-green-50 border border-green-100 p-3 items-center">
            <Text className="text-[12px] text-gray-600">Interactive</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-green-50 border border-green-100 p-3 items-center">
            <Text className="text-[12px] text-gray-600">Safe</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-green-50 border border-green-100 p-3 items-center">
            <Text className="text-[12px] text-gray-600">Fast</Text>
          </View>
        </View>

        <Text className="text-[13px] text-gray-500 mb-2">Unique Username</Text>
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4">
          <Ionicons name="person-outline" size={18} color="#6B7280" />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-[15px] text-gray-900"
          />
        </View>

        <Text className="text-[13px] text-gray-500 mb-2">6-digit PIN</Text>
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
          <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
          <TextInput
            value={pin}
            onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter 6-digit PIN"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            className="ml-3 flex-1 text-[15px] text-gray-900"
          />
        </View>

        <TouchableOpacity
          onPress={login}
          disabled={!canLogin}
          className={[
            "mt-6 rounded-2xl py-4 items-center",
            canLogin ? "bg-green-600" : "bg-green-300",
          ].join(" ")}
        >
          <Text className="text-white text-[15px] font-semibold">Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-pin")}
          className="mt-4 items-center"
        >
          <Text className="text-[13px] text-green-700 font-semibold">
            Forgot PIN? Use phone OTP
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center my-5">
          <View className="flex-1 h-[1px] bg-gray-100" />
          <Text className="mx-3 text-[12px] text-gray-400">OR</Text>
          <View className="flex-1 h-[1px] bg-gray-100" />
        </View>

        <TouchableOpacity
          onPress={login}
          className="rounded-2xl border border-gray-200 py-4 items-center bg-white"
        >
          <Text className="text-[15px] font-semibold text-gray-900">
            Continue as Guest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          className="mt-5 items-center"
        >
          <Text className="text-[13px] text-gray-500">
            Don’t have an account?{" "}
            <Text className="text-green-700 font-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
