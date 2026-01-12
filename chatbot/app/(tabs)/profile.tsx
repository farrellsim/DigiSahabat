import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getSession } from "../../lib/protoSession";

export default function Profile() {
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
        <Text className="text-[18px] font-semibold text-gray-900">
          My Profile
        </Text>

        <View
          className="mt-5 rounded-2xl border border-gray-200 overflow-hidden bg-white"
          style={{
            shadowOpacity: 0.06,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1200&q=80",
            }}
            style={{ height: 130, width: "100%" }}
          />

          <View className="px-5 py-5">
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-2xl bg-green-600 items-center justify-center">
                <Ionicons name="person" size={26} color="white" />
              </View>
              <View className="ml-4">
                <Text className="text-[13px] text-gray-500">Name:</Text>
                <Text className="text-[18px] font-semibold text-gray-900">
                  {name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/settings")}
                className="ml-auto w-10 h-10 rounded-2xl bg-white border border-gray-200 items-center justify-center"
              >
                <Ionicons name="create-outline" size={18} color="#111827" />
              </TouchableOpacity>
            </View>

            <View className="mt-5">
              <View className="flex-row justify-between">
                <Text className="text-[13px] text-gray-500">
                  Learning Progress
                </Text>
                <Text className="text-[13px] text-gray-500">30%</Text>
              </View>
              <View className="mt-2 bg-gray-100 rounded-full h-2 overflow-hidden">
                <View className="bg-green-600 h-2 w-[30%]" />
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row gap-4 mt-5">
          <View className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <Text className="text-[22px] font-semibold text-gray-900">3</Text>
            <Text className="text-[12px] text-gray-500 mt-1">
              Modules Completed
            </Text>
          </View>
          <View className="flex-1 rounded-2xl border border-gray-200 bg-white px-4 py-4">
            <Text className="text-[22px] font-semibold text-gray-900">2</Text>
            <Text className="text-[12px] text-gray-500 mt-1">
              Badges Earned
            </Text>
          </View>
        </View>

        <View className="mt-5 rounded-2xl border border-gray-200 bg-white px-5 py-4">
          <Text className="text-[15px] font-semibold text-gray-900">
            My Badges
          </Text>
          <View className="flex-row gap-3 mt-3">
            {["First Steps", "Quick Learner"].map((b) => (
              <View
                key={b}
                className="flex-1 rounded-2xl bg-gray-50 border border-gray-200 px-3 py-3 items-center"
              >
                <Text className="text-[18px]">🏆</Text>
                <Text className="text-[12px] text-gray-700 mt-1 text-center">
                  {b}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/screens/leaderboard")}
          className="mt-5 rounded-2xl bg-green-600 py-4 items-center"
        >
          <Text className="text-white text-[15px] font-semibold">
            View Leaderboard
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
