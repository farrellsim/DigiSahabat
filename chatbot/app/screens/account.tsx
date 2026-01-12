import React, { useState } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Account() {
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-[18px] font-semibold text-gray-900">
            Account
          </Text>
        </View>

        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4">
          <Text className="text-[14px] font-semibold text-gray-900">
            Change Username
          </Text>
          <View className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter new username"
              placeholderTextColor="#9CA3AF"
              className="text-[15px] text-gray-900"
            />
          </View>
        </View>

        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4">
          <Text className="text-[14px] font-semibold text-gray-900">
            Change Phone Number
          </Text>
          <View className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter new phone number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              className="text-[15px] text-gray-900"
            />
          </View>
        </View>

        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4">
          <Text className="text-[14px] font-semibold text-gray-900">
            Change PIN
          </Text>
          <View className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <TextInput
              value={pin}
              onChangeText={(t) => setPin(t.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter new 6-digit PIN"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              className="text-[15px] text-gray-900"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.back()}
          className="rounded-2xl bg-green-600 py-4 items-center"
        >
          <Text className="text-white text-[15px] font-semibold">
            Save Changes
          </Text>
        </TouchableOpacity>

        <Text className="text-[12px] text-gray-400 mt-3">
          Prototype note: changes are UI-only (not persisted).
        </Text>
      </View>
    </SafeAreaView>
  );
}
