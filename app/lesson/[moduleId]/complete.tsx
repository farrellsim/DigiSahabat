import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Star, Trophy } from "lucide-react-native";
import { MODULES } from "../../../src/data/modules";
import { useAppStore } from "../../../src/store/app.store";
import { theme } from "../../../src/constants/theme";

const BADGE_EMOJI: Record<string, string> = {
  tech_explorer: "📱",
  safe_learner: "🛡️",
  digital_citizen: "🌐",
};

export default function Complete() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const { xp } = useAppStore();
  const mod = MODULES.find((m) => m.id === moduleId) ?? MODULES[0];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.color.primary }} edges={["top", "bottom"]}>
      <View className="flex-1 px-6 items-center justify-center">
        <Text className="text-[72px] mb-4">🎉</Text>

        <Text className="text-[28px] font-bold text-white text-center mb-2">
          Congratulations!
        </Text>
        <Text className="text-[16px] text-center mb-8 leading-6 text-white/80">
          You completed the {mod.title} module!
        </Text>

        {/* Badge card */}
        <View
          className="rounded-3xl px-8 py-8 items-center w-full mb-6"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Text className="text-[60px] mb-3">{BADGE_EMOJI[mod.badgeCode] ?? "🏆"}</Text>
          <Text className="text-[20px] font-bold text-white text-center">
            {mod.badgeName}
          </Text>
          <Text className="text-[14px] text-center mt-2 leading-5 text-white/80">
            {mod.badgeDescription}
          </Text>
          <View
            className="mt-4 flex-row items-center px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
          >
            <Star size={16} color={theme.color.warning} fill={theme.color.warning} />
            <Text className="text-white font-bold text-[15px] ml-2">
              +{mod.xpReward} XP earned
            </Text>
          </View>
        </View>

        {/* Total XP */}
        <View
          className="flex-row items-center px-5 py-3 rounded-2xl mb-8"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <Trophy size={18} color={theme.color.warning} />
          <Text className="text-white font-semibold text-[14px] ml-2">
            Total XP: {xp}
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/(tabs)/friends" as any)}
          className="w-full rounded-2xl py-4 items-center mb-3"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Text className="text-white text-[15px] font-bold">View Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.replace("/(tabs)/home")}
          className="w-full rounded-2xl py-4 items-center bg-white"
        >
          <Text className="text-[15px] font-bold" style={{ color: theme.color.primary }}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
