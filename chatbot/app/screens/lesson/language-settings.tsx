import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Import database services
import { setLanguage, getLanguage, refreshTranslations, initDB } from "../../../src/services/db";

const LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: '🇲🇾',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
  },
];

export default function LanguageSettings() {
  const [selectedLanguage, setSelectedLanguage] = useState(getLanguage());
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (languageCode: any) => {
    setIsChanging(true);
    
    // Set the new language
    setLanguage(languageCode);
    setSelectedLanguage(languageCode);
    
    // Refresh translations
    refreshTranslations();
    
    // Re-initialize database with new language
    initDB();
    
    // Small delay for visual feedback
    setTimeout(() => {
      setIsChanging(false);
      // Optionally go back after changing
      // router.back();
    }, 500);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-[20px] font-bold text-gray-900">
              Language / Bahasa
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 py-6">
            {/* Info Card */}
            <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={24} color="#2563eb" />
                <View className="flex-1 ml-3">
                  <Text className="text-[14px] text-blue-900 font-medium">
                    Choose Your Language
                  </Text>
                  <Text className="text-[13px] text-blue-700 mt-1">
                    Select your preferred language for the app. All content will be translated.
                  </Text>
                </View>
              </View>
            </View>

            {/* Language Options */}
            <View className="space-y-3">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code)}
                    disabled={isChanging}
                    className={`rounded-2xl border-2 p-5 bg-white ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200"
                    }`}
                    style={{
                      shadowOpacity: isSelected ? 0.1 : 0.04,
                      shadowRadius: isSelected ? 10 : 6,
                      shadowOffset: { width: 0, height: isSelected ? 4 : 2 },
                      elevation: isSelected ? 3 : 1,
                    }}
                  >
                    <View className="flex-row items-center">
                      {/* Flag */}
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-4">
                        <Text className="text-[28px]">{lang.flag}</Text>
                      </View>

                      {/* Language Info */}
                      <View className="flex-1">
                        <Text
                          className={`text-[18px] font-bold ${
                            isSelected ? "text-green-900" : "text-gray-900"
                          }`}
                        >
                          {lang.nativeName}
                        </Text>
                        <Text
                          className={`text-[14px] mt-1 ${
                            isSelected ? "text-green-700" : "text-gray-500"
                          }`}
                        >
                          {lang.name}
                        </Text>
                      </View>

                      {/* Check Icon */}
                      {isSelected && (
                        <View className="w-8 h-8 rounded-full bg-green-600 items-center justify-center">
                          <Ionicons name="checkmark" size={20} color="white" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Additional Info */}
            <View className="mt-8 px-4">
              <Text className="text-[13px] text-gray-500 text-center leading-5">
                Changing language will update all module titles, descriptions, and lessons. Your progress will be preserved.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}