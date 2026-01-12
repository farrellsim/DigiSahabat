import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ModuleOverview() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-[18px] font-semibold text-gray-900">
            Learning Tech Devices
          </Text>
        </View>

        <View
          className="rounded-2xl border border-gray-200 overflow-hidden bg-white"
          style={{
            shadowOpacity: 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1521540216272-a50305cd4421?w=1200&q=80",
            }}
            style={{ height: 180, width: "100%" }}
          />
          <View className="px-5 py-4">
            <Text className="text-[18px] font-semibold text-gray-900">
              Learning Tech Devices
            </Text>
            <Text className="text-[13px] text-gray-500 mt-1">
              Learn about common technology devices used in daily life.
            </Text>

            <View className="mt-4">
              <Text className="text-[13px] text-gray-500 mb-2">
                WHAT YOU’LL LEARN
              </Text>

              {["Introduction to Technology", "Printer"].map((x) => (
                <View key={x} className="flex-row items-center mb-2">
                  <View className="w-6 h-6 rounded-full bg-green-100 items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={16} color="#4CAF7A" />
                  </View>
                  <Text className="text-[14px] text-gray-800">{x}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => router.push(`/screens/lesson/${String(id)}-p1`)}
              className="mt-5 rounded-2xl bg-green-600 py-4 items-center"
            >
              <Text className="text-white text-[15px] font-semibold">
                Start Module
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
