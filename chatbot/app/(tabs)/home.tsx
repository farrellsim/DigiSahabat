import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { getSession } from "../../lib/protoSession";

export default function Home() {
  const [name, setName] = useState("Aunty Lela");

  useEffect(() => {
    (async () => {
      const s = await getSession();
      if (s.username) setName(s.username);
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <Text className="text-[13px] text-gray-500">Welcome,</Text>
        <Text className="text-[24px] font-semibold text-gray-900 mt-1">
          {name}
        </Text>

        {/* Progress Card */}
        <View
          className="mt-6 rounded-2xl bg-green-600 px-5 py-5"
          style={{
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <View className="flex-row items-center">
            <Ionicons name="trending-up" size={18} color="white" />
            <Text className="text-white text-[14px] font-semibold ml-2">
              Your Learning Progress
            </Text>
          </View>

          <View className="mt-4 bg-white/30 rounded-full h-2 overflow-hidden">
            <View className="bg-white h-2 w-[30%]" />
          </View>

          <View className="flex-row justify-between mt-3">
            <Text className="text-white/90 text-[12px]">
              3 of 10 modules completed
            </Text>
            <View className="px-3 py-1 rounded-full bg-white/25">
              <Text className="text-white text-[12px] font-semibold">30%</Text>
            </View>
          </View>
        </View>

        {/* Big Learning Modules Card */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/learn")}
          className="mt-5 rounded-2xl border border-gray-200 overflow-hidden"
          style={{
            shadowOpacity: 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <View className="bg-green-50 px-5 py-6">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[18px] font-semibold text-gray-900">
                  Learning{"\n"}Modules
                </Text>
                <Text className="text-[13px] text-gray-500 mt-2">
                  Continue your digital journey
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-white border border-gray-200 items-center justify-center">
                <Ionicons name="chevron-forward" size={20} color="#111827" />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Tiles */}
        <View className="flex-row gap-4 mt-5">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/chat")}
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-4 bg-white"
            style={{
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }}
          >
            <Text className="text-[15px] font-semibold text-gray-900">
              DigiBuddy
            </Text>
            <Text className="text-[12px] text-gray-500 mt-1">
              Ask AI assistant
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-4 bg-white"
            style={{
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }}
          >
            <Text className="text-[15px] font-semibold text-gray-900">
              Achievements
            </Text>
            <Text className="text-[12px] text-gray-500 mt-1">
              Badges & rewards
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
