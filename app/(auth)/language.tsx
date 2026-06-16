import { useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { setSession } from "../../lib/protoSession";
import { refreshTranslations, setLanguage } from "../../src/services/db";

function LangCard({
  title,
  subtitle,
  selected,
  onPress,
}: {
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={[
        "rounded-2xl border px-5 py-4 mb-4 bg-white",
        selected ? "border-green-500" : "border-gray-200",
      ].join(" ")}
      style={{
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
        elevation: 2,
      }}
    >
      <Text className="text-[16px] font-semibold text-gray-900">{title}</Text>
      <Text className="text-[13px] text-gray-500 mt-1">{subtitle}</Text>
    </TouchableOpacity>
  );
}

export default function Language() {
  const [lang, setLang] = useState<"en" | "ms">("en");

  const next = async () => {
    await setSession({ language: lang });
    setLanguage(lang);
    refreshTranslations();
    router.push("/(auth)/literacy-assessment"); // Changed from signup
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pt-10">
        <View className="w-16 h-16 rounded-2xl bg-green-100 items-center justify-center mb-6">
          <Text className="text-[22px]">🌐</Text>
        </View>

        <Text className="text-[26px] font-semibold text-gray-900">
          Choose Your Language / {"\n"}Pilih Bahasa Anda
        </Text>
        <Text className="text-[13px] text-gray-500 mt-2 mb-6">
          Select your preferred language
        </Text>

        <LangCard
          title="English"
          subtitle="Primary language"
          selected={lang === "en"}
          onPress={() => setLang("en")}
        />

        <LangCard
          title="Malay"
          subtitle="Bahasa Melayu"
          selected={lang === "ms"}
          onPress={() => setLang("ms")}
        />

        <TouchableOpacity
          onPress={() => {
            refreshTranslations();
            next();
          }}
          className="mt-2 rounded-2xl bg-green-600 py-4 items-center"
        >
          <Text className="text-white text-[15px] font-semibold">Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="mt-5 items-center"
        >
          <Text className="text-[13px] text-gray-500">
            Already have an account?{" "}
            <Text className="text-green-700 font-semibold">Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
