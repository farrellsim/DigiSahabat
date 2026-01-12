import React from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const MODULES = [
  {
    id: "tech-devices",
    title: "Learning Tech Devices",
    desc: "Learn about common technology devices used in daily life.",
    mins: 15,
    status: "Not Started",
    image:
      "https://images.unsplash.com/photo-1521540216272-a50305cd4421?w=1200&q=80",
  },
  {
    id: "internet-basics",
    title: "Internet Basics",
    desc: "Understanding how the internet works and how to use it safely.",
    mins: 15,
    status: "Completed",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  },
];

export default function Learn() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="flex-row items-center mb-4">
          <Text className="text-[20px] font-semibold text-gray-900">
            Learning Modules
          </Text>
        </View>
        <Text className="text-[13px] text-gray-500 mb-6">
          Tech learning, made simple and structured.
        </Text>

        {MODULES.map((m) => (
          <View
            key={m.id}
            className="rounded-2xl border border-gray-200 overflow-hidden mb-5 bg-white"
            style={{
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 2,
            }}
          >
            <Image
              source={{ uri: m.image }}
              style={{ height: 140, width: "100%" }}
            />

            <View className="px-5 py-4">
              <Text className="text-[16px] font-semibold text-gray-900">
                {m.title}
              </Text>
              <Text className="text-[13px] text-gray-500 mt-1">{m.desc}</Text>

              <View className="flex-row items-center mt-3">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-[12px] text-gray-500 ml-2">
                  {m.mins} mins
                </Text>

                <View className="ml-auto px-3 py-1 rounded-full border border-gray-200 bg-gray-50">
                  <Text className="text-[12px] text-gray-600">{m.status}</Text>
                </View>
              </View>

              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => router.push(`/screens/module/${m.id}`)}
                  className="flex-1 rounded-2xl bg-green-600 py-3 items-center"
                >
                  <Text className="text-white text-[14px] font-semibold">
                    {m.status === "Completed" ? "Review" : "Start Learning"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push(`/screens/module/${m.id}`)}
                  className="w-12 rounded-2xl border border-gray-200 items-center justify-center bg-white"
                >
                  <Ionicons name="chevron-forward" size={20} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
