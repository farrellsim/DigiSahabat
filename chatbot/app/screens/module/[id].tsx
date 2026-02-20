import React, { useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Import your database services
import { getModuleById, getLessonsByModule, updateModuleProgress } from "../../../src/services/db";

export default function ModuleDetail() {
  const { id } = useLocalSearchParams();
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const moduleData = getModuleById(Number(id));
          const lessonsData = getLessonsByModule(Number(id));
          setModule(moduleData);
          setLessons(lessonsData);
        } catch (e) {
          console.error("Failed to load module:", e);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [id])
  );

  const handleLessonPress = (lessonId: number, lessonType: string) => {
    if (lessonType === "quiz") {
      router.push(`/screens/quiz/${id}`);
    } else {
      router.push(`/screens/lesson/${lessonId}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-3 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
            <Text className="text-[16px] font-medium text-gray-900 ml-2">
              Back
            </Text>
          </TouchableOpacity>

          <Text className="text-[24px] font-bold text-gray-900">
            {module?.title}
          </Text>
          <Text className="text-[14px] text-gray-500 mt-2">
            {module?.desc}
          </Text>

          <View className="flex-row items-center mt-4">
            <Ionicons name="time-outline" size={18} color="#6B7280" />
            <Text className="text-[13px] text-gray-600 ml-2">
              {module?.mins} mins total
            </Text>
            <View className="mx-3 w-1 h-1 rounded-full bg-gray-400" />
            <Text className="text-[13px] text-gray-600">
              {lessons.length} lessons
            </Text>
          </View>
        </View>

        {/* Lessons List */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {lessons.map((lesson, index) => (
            <TouchableOpacity
              key={lesson.id}
              onPress={() => handleLessonPress(lesson.id, lesson.type)}
              className="mb-4"
            >
              <View
                className="rounded-2xl border border-gray-200 bg-white p-5"
                style={{
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 1,
                }}
              >
                <View className="flex-row items-start">
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      lesson.completed
                        ? "bg-green-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {lesson.completed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#16a34a"
                      />
                    ) : (
                      <Text className="text-[14px] font-semibold text-gray-600">
                        {index + 1}
                      </Text>
                    )}
                  </View>

                  <View className="flex-1 ml-4">
                    <View className="flex-row items-center">
                      <Text className="text-[16px] font-semibold text-gray-900 flex-1">
                        {lesson.title}
                      </Text>
                      {lesson.type === "quiz" && (
                        <View className="px-3 py-1 rounded-full bg-purple-100">
                          <Text className="text-[11px] font-semibold text-purple-700">
                            QUIZ
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text className="text-[13px] text-gray-500 mt-1">
                      {lesson.description}
                    </Text>

                    <View className="flex-row items-center mt-3">
                      <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                      <Text className="text-[12px] text-gray-400 ml-1">
                        {lesson.duration} mins
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#D1D5DB"
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}