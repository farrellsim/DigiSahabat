import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

export default function Completion() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10 items-center">
        <View
          className="w-28 h-28 rounded-2xl bg-white border border-gray-200 items-center justify-center mt-8"
          style={{
            shadowOpacity: 0.08,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 3,
          }}
        >
          <Text className="text-[44px]">🏆</Text>
        </View>

        <Text className="text-[26px] font-semibold text-gray-900 mt-8">
          Congratulations!
        </Text>
        <Text className="text-[13px] text-gray-500 mt-2 text-center">
          You have completed the Learning Tech Devices module
        </Text>

        <View className="mt-6 w-full rounded-2xl border border-gray-200 bg-white px-5 py-4">
          <Text className="text-[13px] text-gray-500 text-center">
            ✨ Badge Earned ✨
          </Text>
          <View className="mt-3 rounded-2xl bg-green-600 py-4 items-center">
            <Text className="text-white text-[15px] font-semibold">
              🏅 Tech Explorer
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/home")}
          className="mt-6 w-full rounded-2xl bg-green-600 py-4 items-center"
        >
          <Text className="text-white text-[15px] font-semibold">
            Back to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/learn")}
          className="mt-3 w-full rounded-2xl border border-gray-200 py-4 items-center bg-white"
        >
          <Text className="text-[15px] font-semibold text-gray-900">
            Explore More Modules
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
