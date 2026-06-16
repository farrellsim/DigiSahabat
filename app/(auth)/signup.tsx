import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { setSession } from "../../lib/protoSession";
import { useAppStore } from "../../src/store/app.store";

function Field({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: "default" | "number-pad" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
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
          autoCapitalize={autoCapitalize ?? "sentences"}
          className="ml-3 flex-1 text-[15px] text-gray-900"
        />
      </View>
    </View>
  );
}

export default function Signup() {
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameValid = /^[a-zA-Z0-9_]{3,32}$/.test(username.trim());

  const canContinue = useMemo(
    () =>
      displayName.trim().length >= 1 &&
      usernameValid &&
      pin.length === 6 &&
      !loading,
    [displayName, usernameValid, pin, loading]
  );

  const start = async () => {
    if (!canContinue) return;
    setLoading(true);
    setError(null);
    try {
      await useAppStore.getState().signupWithPin({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        pin,
        confirmPin: pin,
        phoneNumber: phone.trim() || undefined,
      });
      await setSession({ isAuthed: true, username: username.trim().toLowerCase() });
      router.replace("/(tabs)/home");
    } catch (e: any) {
      if (e?.status === 409) {
        setError("That username is already taken. Choose another.");
      } else {
        setError("Could not reach the server. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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

        <Field
          label="Display Name"
          placeholder="e.g. Aunty Lela"
          icon="happy-outline"
          value={displayName}
          onChangeText={(t) => {
            setDisplayName(t);
            setError(null);
          }}
        />

        <Field
          label="Unique Username"
          placeholder="letters, numbers, _"
          icon="person-outline"
          value={username}
          onChangeText={(t) => {
            setUsername(t);
            setError(null);
          }}
          autoCapitalize="none"
        />
        {username.trim().length > 0 && !usernameValid ? (
          <Text className="text-[12px] text-red-500 mb-3 -mt-2">
            3–32 characters: letters, numbers, underscore only.
          </Text>
        ) : null}

        <Field
          label="Phone Number (optional)"
          placeholder="Enter your phone number"
          icon="call-outline"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <View className="mb-3">
          <Text className="text-[13px] text-gray-500 mb-2">6-digit PIN</Text>
          <View className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
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
              className="text-[15px] text-gray-900"
            />
          </View>
        </View>

        {error ? (
          <Text className="text-[12px] text-red-500 mb-2">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={start}
          disabled={!canContinue}
          className={[
            "mt-2 rounded-2xl py-4 items-center flex-row justify-center",
            canContinue ? "bg-green-600" : "bg-green-300",
          ].join(" ")}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-[15px] font-semibold">
              Start Learning
            </Text>
          )}
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
