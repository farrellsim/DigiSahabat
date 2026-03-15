import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { clearSession, getSession, setSession } from "../../lib/protoSession";
import { setLanguage, getLanguage, refreshTranslations, initDB, t } from "@/src/services/db";

// Language options with flags and native names
const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  // { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

export default function Settings() { 
  const [language, setLanguageState] = useState<'en' | 'ms' | 'zh'>('en');
  const [textSize, setTextSize] = useState<"Small" | "Medium" | "Large">("Medium");
  const [notifications, setNotifications] = useState(true);
  const [voice, setVoice] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger

  // Load settings when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    const s = await getSession();
    const currentLang = getLanguage();
    
    console.log('📝 Loading settings, current language:', currentLang);
    
    setLanguageState(currentLang);
    setTextSize(s.textSize ?? "Medium");
    setNotifications(!!s.notifications);
    setVoice(!!s.voice);
  };

  const toggleNotif = async () => {
    const next = !notifications;
    setNotifications(next);
    await setSession({ notifications: next });
  };

  const toggleVoice = async () => {
    const next = !voice;
    setVoice(next);
    await setSession({ voice: next });
  };

  const changeLang = () => {
    // Navigate to full language selector screen
    router.push("../screens/lesson/language-settings");
  };

  const changeLanguageInline = async (newLang: 'en' | 'ms' | 'zh') => {
    try {
      console.log('🌍 Changing language to:', newLang);
      
      // Update local state immediately
      setLanguageState(newLang);
      
      // Update database language - this will trigger subscribeToLanguageChange
      setLanguage(newLang);
      
      // Save to session
      await setSession({ language: newLang });
      
      // Force immediate re-render
      setForceUpdate(prev => prev + 1);
      
      // Show success message in the new language
      const successMessages = {
        en: {
          title: "Language Changed",
          message: "All learning modules have been updated to your selected language.",
        },
        ms: {
          title: "Bahasa Ditukar",
          message: "Semua modul pembelajaran telah dikemas kini ke bahasa yang anda pilih.",
        },
        zh: {
          title: "语言已更改",
          message: "所有学习模块已更新为您选择的语言。",
        },
      };
      
      const msg = successMessages[newLang];
      
      Alert.alert(msg.title, msg.message, [{ text: "OK" }]);
      
      console.log('✅ Language changed successfully to:', newLang);
    } catch (error) {
      console.error("❌ Error changing language:", error);
      Alert.alert("Error", "Failed to change language. Please try again.");
    }
  };

  const signOut = async () => {
    await clearSession();
    router.replace("/(auth)/language");
  };

  const TextSizeOption = ({
    label,
  }: {
    label: "Small" | "Medium" | "Large";
  }) => {
    const selected = textSize === label;
    return (
      <TouchableOpacity
        onPress={async () => {
          setTextSize(label);
          await setSession({ textSize: label });
        }}
        className={[
          "rounded-2xl border px-4 py-4 mb-3",
          selected
            ? "border-green-500 bg-green-50"
            : "border-gray-200 bg-white",
        ].join(" ")}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] text-gray-900">{label} Text</Text>
          {selected ? (
            <Ionicons name="checkmark-circle" size={18} color="#4CAF7A" />
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  // Get current language display info
  const currentLangInfo = LANGUAGES.find(l => l.code === language);

  return (
    <SafeAreaView className="flex-1 bg-white" key={`settings-${forceUpdate}`}>
      <View className="px-6 pt-10">
        <View className="flex-row items-center mb-5">
          <Text className="text-[18px] font-semibold text-gray-900">
            {t("settings.title")}
          </Text>
        </View>

        {/* Language - Enhanced with dropdown/picker style */}
        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
              <Ionicons name="globe-outline" size={18} color="#4CAF7A" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-gray-900">
                Language / Bahasa
              </Text>
              <Text className="text-[12px] text-gray-500">
                {currentLangInfo?.flag} {currentLangInfo?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={changeLang}
              className="px-4 py-2 rounded-2xl bg-green-600"
            >
              <Text className="text-white text-[12px] font-semibold">
                {t("settings.languageChange")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Language Options */}
          <View className="pt-3 border-t border-gray-100">
            <Text className="text-[12px] text-gray-500 mb-2">{t("settings.languageQS")}</Text>
            <View className="flex-row flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => changeLanguageInline(lang.code as any)}
                    className={`flex-row items-center px-3 py-2 rounded-full border ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <Text className="text-[16px] mr-1">{lang.flag}</Text>
                    <Text
                      className={`text-[12px] font-medium ${
                        isSelected ? "text-green-700" : "text-gray-600"
                      }`}
                    >
                      {lang.code.toUpperCase()}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#4CAF7A"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Voice */}
        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
              <Ionicons name="volume-high-outline" size={18} color="#4CAF7A" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-gray-900">
                {t("settings.voice")}
              </Text>
              <Text className="text-[12px] text-gray-500">
                {t("settings.voiceSub")}
              </Text>
            </View>
            <Switch value={voice} onValueChange={toggleVoice} />
          </View>
        </View>

        {/* Notifications */}
        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#4CAF7A"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-gray-900">
                {t("settings.notification")}
              </Text>
              <Text className="text-[12px] text-gray-500">
                {t("settings.notificationSub")}
              </Text>
            </View>
            <Switch value={notifications} onValueChange={toggleNotif} />
          </View>
        </View>

        {/* Text size */}
        <View className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
              <Ionicons name="text-outline" size={18} color="#4CAF7A" />
            </View>
            <View>
              <Text className="text-[14px] font-semibold text-gray-900">
                {t("settings.textsize")}
              </Text>
              <Text className="text-[12px] text-gray-500">
                {t("settings.textsizeSub")}
              </Text>
            </View>
          </View>
          <TextSizeOption label="Small" />
          <TextSizeOption label="Medium" />
          <TextSizeOption label="Large" />
        </View>

        {/* Account */}
        <TouchableOpacity
          onPress={() => router.push("/screens/account")}
          className="rounded-2xl border border-gray-200 bg-white px-5 py-4 mb-4"
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-green-100 items-center justify-center mr-3">
              <Ionicons
                name="person-circle-outline"
                size={18}
                color="#4CAF7A"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-gray-900">
                {t("settings.account")}
              </Text>
              <Text className="text-[12px] text-gray-500">
                {t("settings.accountSub")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#111827" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} className="items-center mt-2">
          <Text className="text-[14px] font-semibold text-red-500">
            {t("settings.logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}