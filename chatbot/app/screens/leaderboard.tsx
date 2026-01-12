import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const DATA = [
  { name: "Jonas", modules: 5, medal: "🥇" },
  { name: "Lela", modules: 4, medal: "🥈" },
  { name: "Suri", modules: 3, medal: "🥉" },
  { name: "Amira", modules: 3, medal: "" },
  { name: "Malik", modules: 2, medal: "" },
];

export default function Leaderboard() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="flex-row items-center mb-5">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-[18px] font-semibold text-gray-900">
            Badges & Leaderboard
          </Text>
        </View>

        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
          <Text className="text-[15px] font-semibold text-gray-900">
            Community Leaderboard
          </Text>
          <View className="mt-4">
            {DATA.map((x, idx) => (
              <View
                key={x.name}
                className={[
                  "flex-row items-center rounded-2xl px-4 py-4 mb-3 border",
                  idx === 1
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white",
                ].join(" ")}
              >
                <Text className="w-8 text-[16px]">
                  {x.medal || `${idx + 1}`}
                </Text>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-gray-900">
                    {x.name}
                  </Text>
                  <Text className="text-[12px] text-gray-500">
                    {x.modules} modules completed
                  </Text>
                </View>
                <Ionicons name="trophy-outline" size={18} color="#6B7280" />
              </View>
            ))}
          </View>

          <View className="mt-2 rounded-2xl bg-green-50 border border-green-100 px-4 py-4">
            <Text className="text-[12px] text-gray-600">
              This leaderboard shows community progress to inspire learning.
              It’s not about competition, but celebrating everyone’s journey!
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
