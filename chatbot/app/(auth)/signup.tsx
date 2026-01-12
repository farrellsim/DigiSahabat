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

function Field({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "number-pad" | "phone-pad";
}) {
  return (
    <View className="mb-4">
      <Text className="text-[13px] text-gray-500 mb-2">{label}</Text>
      <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
        <Ionicons name={icon} size={18} color="#6B7280" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType ?? "default"}
          className="ml-3 flex-1 text-[15px] text-gray-900"
        />
      </View>
    </View>
  );
}

function PinRow({ pin, setPin }: { pin: string; setPin: (t: string) => void }) {
  return (
    <View className="mb-3">
      <Text className="text-[13px] text-gray-500 mb-2">6-digit PIN</Text>
      <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
        <TextInput
          value={pin}
          onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit PIN"
          placeholderTextColor="#9CA3AF"
          keyboardType="number-pad"
          className="text-[15px] text-gray-900"
        />
      </View>
      <Text className="text-[12px] text-gray-400 mt-2">
        Prototype note: PIN is not stored securely.
      </Text>
    </View>
  );
}

export default function Signup() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  // Fake “unique username” check: if username equals "admin" or "test", show taken
  const usernameTaken = useMemo(() => {
    const u = username.trim().toLowerCase();
    return u === "admin" || u === "test" || u === "auntylela";
  }, [username]);

  const canContinue =
    username.trim().length >= 3 &&
    !usernameTaken &&
    phone.trim().length >= 8 &&
    pin.length === 6;

  const start = async () => {
    // Prototype: mark authed and go to tabs
    await setSession({
      isAuthed: true,
      username: username.trim(),
      phone: phone.trim(),
    });
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="w-16 h-16 rounded-2xl bg-green-100 items-center justify-center mb-6">
          <Text className="text-[22px]">📖</Text>
        </View>

        <Text className="text-[26px] font-semibold text-gray-900">
          Get Started
        </Text>
        <Text className="text-[13px] text-gray-500 mt-2 mb-6">
          Start your digital learning adventure today
        </Text>

        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 rounded-2xl bg-green-50 border border-green-100 p-3 items-center">
            <Text className="text-[12px] text-gray-600">Easy Start</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-green-50 border border-green-100 p-3 items-center">
            <Text className="text-[12px] text-gray-600">Rewarding</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-green-50 border border-green-100 p-3 items-center">
            <Text className="text-[12px] text-gray-600">Supportive</Text>
          </View>
        </View>

        <Field
          label="Unique Username"
          placeholder="Choose a username"
          icon="person-outline"
          value={username}
          onChangeText={setUsername}
        />
        {username.trim().length > 0 && usernameTaken ? (
          <Text className="text-[12px] text-red-500 mb-3">
            Username is already taken (prototype rule).
          </Text>
        ) : null}

        <Field
          label="Phone Number"
          placeholder="Enter your phone number"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <PinRow pin={pin} setPin={setPin} />

        <TouchableOpacity
          onPress={start}
          disabled={!canContinue}
          className={[
            "mt-2 rounded-2xl py-4 items-center",
            canContinue ? "bg-green-600" : "bg-green-300",
          ].join(" ")}
        >
          <Text className="text-white text-[15px] font-semibold">
            Start Learning
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="mt-5 items-center"
        >
          <Text className="text-[13px] text-gray-500">
            Already have an account?{" "}
            <Text className="text-green-700 font-semibold">Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
