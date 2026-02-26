import React, { useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Import your database services (adjust path if needed)
import { initDB, getModules, getModulesByCategory, t, getLanguage } from "../../src/services/db";

const CATEGORIES = [
  { id: "all", label: "All", icon: "apps" },
  { id: "communication", label: "Communication", icon: "chatbubbles" },
  { id: "navigation", label: "Navigation", icon: "map" },
  { id: "finance", label: "Finance", icon: "card" },
  { id: "entertainment", label: "Entertainment", icon: "play-circle" },
  { id: "shopping", label: "Shopping", icon: "cart" },
];

export default function Learn() {
  const [modules, setModules] = useState<any[]>([]);
  const [filteredModules, setFilteredModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());

  // Load data every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        setLoading(true);
        try {
          // Get the current language to detect changes
          const lang = getLanguage();
          setCurrentLanguage(lang);
          
          // Initialize DB (creates tables/seeds data if new)
          initDB();
          
          // Fetch modules joined with progress
          const data = getModules();
          setModules(data);
          
          // Apply current category filter
          if (selectedCategory === "all") {
            setFilteredModules(data);
          } else {
            const filtered = getModulesByCategory(selectedCategory);
            setFilteredModules(filtered);
          }
        } catch (e) {
          console.error("Failed to load modules:", e);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, []) // Re-run when screen comes into focus
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === "all") {
      setFilteredModules(modules);
    } else {
      const filtered = getModulesByCategory(categoryId);
      setFilteredModules(filtered);
    }
  };

  const getStatusColor = (status: string) => {
    // Handle multiple language statuses
    const isCompleted = status === "Completed" || status === "Selesai" || status === "已完成" || status === "முடிந்தது";
    const isInProgress = status === "In Progress" || status === "Dalam Kemajuan" || status === "进行中" || status === "முன்னேற்றத்தில்";
    
    if (isCompleted) {
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "checkmark-circle",
        iconColor: "#16a34a",
      };
    } else if (isInProgress) {
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "play-circle",
        iconColor: "#2563eb",
      };
    } else {
      return {
        bg: "bg-gray-50",
        border: "border-gray-200",
        text: "text-gray-600",
        icon: "radio-button-off",
        iconColor: "#6B7280",
      };
    }
  };

  const getButtonText = (status: string) => {
    const isCompleted = status === "Completed" || status === "Selesai" || status === "已完成" || status === "முடிந்தது";
    const isInProgress = status === "In Progress" || status === "Dalam Kemajuan" || status === "进行中" || status === "முன்னேற்றத்தில்";
    
    if (isCompleted) return t('ui.reviewModule');
    if (isInProgress) return t('ui.continueLearning');
    return t('ui.startLearning');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="px-6 pt-6 pb-4 bg-white">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[28px] font-bold text-gray-900">
              {t('ui.learningPath')}
            </Text>
            
            {/* Language Indicator */}
            <View className="flex-row items-center gap-2">
              <View className="px-3 py-1.5 rounded-full bg-green-100 border border-green-200">
                <Text className="text-[12px] font-semibold text-green-700">
                  {currentLanguage.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          
          <Text className="text-[15px] text-gray-600 mt-1">
            {t('ui.masterDigital')}
          </Text>
        </View>

        {/* Stats Overview */}
        <View className="px-6 py-4 bg-white mb-2">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-green-50 rounded-2xl p-4 border border-green-100">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[24px] font-bold text-green-700">
                    {modules.filter((m) => {
                      const status = m.status || "";
                      return status === "Completed" || status === "Selesai" || status === "已完成" || status === "முடிந்தது";
                    }).length}
                  </Text>
                  <Text className="text-[12px] text-green-600 mt-1">
                    {t('ui.completed')}
                  </Text>
                </View>
                <Ionicons name="trophy" size={32} color="#16a34a" />
              </View>
            </View>

            <View className="flex-1 bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[24px] font-bold text-blue-700">
                    {modules.filter((m) => {
                      const status = m.status || "";
                      return status === "In Progress" || status === "Dalam Kemajuan" || status === "进行中" || status === "முன்னேற்றத்தில்";
                    }).length}
                  </Text>
                  <Text className="text-[12px] text-blue-600 mt-1">
                    {t('ui.inProgress')}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={32} color="#2563eb" />
              </View>
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View className="px-6 py-3 bg-white mb-2">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.id;
              
              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2.5 rounded-full border flex-row items-center ${
                    isSelected
                      ? "bg-green-600 border-green-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={16}
                    color={isSelected ? "white" : "#6B7280"}
                  />
                  <Text
                    className={`ml-2 text-[13px] font-semibold ${
                      isSelected ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Modules List */}
        <View className="px-6 pt-4">
          {loading ? (
            <View className="mt-10 items-center">
              <ActivityIndicator size="large" color="#16a34a" />
              <Text className="text-gray-400 mt-3 text-[14px]">
                {t('ui.loadingModules')}
              </Text>
            </View>
          ) : (
            <>
              {filteredModules.map((m, index) => {
                const statusStyle = getStatusColor(m.status || "");

                return (
                  <View
                    key={m.id}
                    className="mb-5"
                    style={{
                      shadowOpacity: 0.08,
                      shadowRadius: 12,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 3,
                    }}
                  >
                    <View className="rounded-3xl overflow-hidden bg-white border border-gray-100">
                      {/* Image Header */}
                      <View className="relative">
                        <Image
                          source={{ uri: m.image }}
                          style={{ height: 160, width: "100%" }}
                        />
                        <View className="absolute top-3 right-3">
                          <View
                            className={`px-3 py-2 rounded-full ${statusStyle.bg} ${statusStyle.border} border flex-row items-center`}
                          >
                            <Ionicons
                              name={statusStyle.icon as any}
                              size={14}
                              color={statusStyle.iconColor}
                            />
                            <Text className={`text-[11px] font-semibold ml-1.5 ${statusStyle.text}`}>
                              {m.status || t('ui.notStarted')}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Content */}
                      <View className="px-5 py-5">
                        <Text className="text-[18px] font-bold text-gray-900">
                          {m.title}
                        </Text>
                        <Text className="text-[14px] text-gray-600 mt-2 leading-5">
                          {m.desc}
                        </Text>

                        {/* Meta Info */}
                        <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
                          <View className="flex-row items-center flex-1">
                            <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center">
                              <Ionicons name="time" size={16} color="#16a34a" />
                            </View>
                            <Text className="text-[13px] text-gray-700 ml-2 font-medium">
                              {m.mins} {t('ui.minutes')}
                            </Text>
                          </View>

                          <View className="flex-row items-center">
                            <Ionicons name="book-outline" size={16} color="#6B7280" />
                            <Text className="text-[13px] text-gray-500 ml-1.5">
                              {t('ui.interactive')}
                            </Text>
                          </View>
                        </View>

                        {/* Action Button */}
                        <TouchableOpacity
                          onPress={() => router.push(`/screens/module/${m.id}`)}
                          className="mt-4 rounded-2xl bg-green-600 py-4 items-center"
                          style={{
                            shadowOpacity: 0.2,
                            shadowRadius: 8,
                            shadowOffset: { width: 0, height: 4 },
                            elevation: 4,
                          }}
                        >
                          <View className="flex-row items-center">
                            <Text className="text-white text-[15px] font-bold">
                              {getButtonText(m.status || "")}
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={18}
                              color="white"
                              style={{ marginLeft: 8 }}
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {/* Empty State Handler */}
          {!loading && filteredModules.length === 0 && (
            <View className="items-center mt-20">
              <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                <Ionicons name="folder-open-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-center text-gray-500 text-[16px] font-medium">
                {t('ui.noModules')}
              </Text>
              <Text className="text-center text-gray-400 text-[14px] mt-2">
                {t('ui.checkBack')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}