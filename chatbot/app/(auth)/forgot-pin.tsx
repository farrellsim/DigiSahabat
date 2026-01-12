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

type Step = "phone" | "otp" | "newpin";

export default function ForgotPin() {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");

  const canSend = phone.trim().length >= 8;
  const canVerify = otp.length === 6;
  const canSave = newPin.length === 6;

  const sendOtp = () => setStep("otp");

  const verifyOtp = () => {
    // Prototype rule: accept 123456 only
    if (otp === "123456") setStep("newpin");
  };

  const savePin = async () => {
    await setSession({ isAuthed: true, phone: phone.trim() });
    router.replace("/(tabs)");
  };

  const subtitle =
    step === "phone"
      ? "Enter your phone number to receive an OTP."
      : step === "otp"
        ? "Enter the 6-digit OTP sent to your phone."
        : "Set a new 6-digit PIN.";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-[20px] font-semibold text-gray-900">
            Forgot PIN
          </Text>
        </View>

        <Text className="text-[13px] text-gray-500 mb-6">{subtitle}</Text>

        {step === "phone" && (
          <>
            <Text className="text-[13px] text-gray-500 mb-2">Phone Number</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                className="ml-3 flex-1 text-[15px] text-gray-900"
              />
            </View>

            <TouchableOpacity
              onPress={sendOtp}
              disabled={!canSend}
              className={[
                "mt-6 rounded-2xl py-4 items-center",
                canSend ? "bg-green-600" : "bg-green-300",
              ].join(" ")}
            >
              <Text className="text-white text-[15px] font-semibold">
                Send OTP
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === "otp" && (
          <>
            <Text className="text-[13px] text-gray-500 mb-2">6-digit OTP</Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Ionicons name="key-outline" size={18} color="#6B7280" />
              <TextInput
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter OTP (try 123456)"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                className="ml-3 flex-1 text-[15px] text-gray-900"
              />
            </View>

            <Text className="text-[12px] text-gray-400 mt-2">
              Prototype OTP: use <Text className="font-semibold">123456</Text>
            </Text>

            <TouchableOpacity
              onPress={verifyOtp}
              disabled={!canVerify}
              className={[
                "mt-6 rounded-2xl py-4 items-center",
                canVerify ? "bg-green-600" : "bg-green-300",
              ].join(" ")}
            >
              <Text className="text-white text-[15px] font-semibold">
                Verify OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setStep("phone")}
              className="mt-4 items-center"
            >
              <Text className="text-[13px] text-gray-500">
                Change phone number
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === "newpin" && (
          <>
            <Text className="text-[13px] text-gray-500 mb-2">
              New 6-digit PIN
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <Ionicons name="lock-closed-outline" size={18} color="#6B7280" />
              <TextInput
                value={newPin}
                onChangeText={(t) =>
                  setNewPin(t.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Enter new PIN"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                className="ml-3 flex-1 text-[15px] text-gray-900"
              />
            </View>

            <TouchableOpacity
              onPress={savePin}
              disabled={!canSave}
              className={[
                "mt-6 rounded-2xl py-4 items-center",
                canSave ? "bg-green-600" : "bg-green-300",
              ].join(" ")}
            >
              <Text className="text-white text-[15px] font-semibold">
                Save PIN
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
