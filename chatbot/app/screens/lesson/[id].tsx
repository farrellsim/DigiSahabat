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

export default function Lesson() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isPart2 = String(id).includes("p2");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View className="flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-green-100 items-center justify-center mr-3">
              <Ionicons name="book-outline" size={18} color="#4CAF7A" />
            </View>
            <View>
              <Text className="text-[16px] font-semibold text-gray-900">
                Learning Tech Devices
              </Text>
              <Text className="text-[12px] text-gray-500">
                Part {isPart2 ? "2" : "1"} of 2
              </Text>
            </View>
          </View>
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
              uri: isPart2
                ? "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1200&q=80"
                : "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",
            }}
            style={{ height: 220, width: "100%" }}
          />

          <View className="px-5 py-5">
            <Text className="text-[18px] font-semibold text-gray-900">
              {isPart2 ? "Printer" : "Introduction to Technology"}
            </Text>

            <Text className="text-[14px] text-gray-700 leading-[22px] mt-2">
              {isPart2
                ? "A printer is a device used to print documents and images. It takes information from a phone or computer and puts it on paper."
                : "Technology devices help us work, learn, and communicate. We use them in our daily life."}
            </Text>

            <TouchableOpacity
              onPress={() => {
                if (isPart2) router.push("/screens/lesson/completion");
                else router.push(`/screens/lesson/tech-devices-p2`);
              }}
              className="mt-6 rounded-2xl bg-green-600 py-4 items-center"
            >
              <Text className="text-white text-[15px] font-semibold">
                {isPart2 ? "Take Quiz" : "Continue Learning"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
