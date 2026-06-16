import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Settings,
  Star,
  Flame,
  CheckCircle2,
  Trophy,
  Users,
  ChevronRight,
} from "lucide-react-native";
import { useAppStore } from "../../src/store/app.store";
import { clearSession } from "../../lib/protoSession";
import { Card } from "../../src/components/ui/Card";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { theme } from "../../src/constants/theme";

const BADGE_ICONS: Record<string, string> = {
  tech_explorer: "📱",
  safe_learner: "🛡️",
  digital_citizen: "🌐",
  first_step: "🎯",
};

export default function Profile() {
  const {
    displayName,
    username,
    xp,
    level,
    streak,
    badges,
    completedModules,
    friends,
  } = useAppStore();

  const xpForCurrentLevel = (level - 1) * 100;
  const xpForNextLevel = level * 100;
  const xpProgress = xp - xpForCurrentLevel;
  const xpNeeded = xpForNextLevel - xpForCurrentLevel;
  const progressPct = Math.min((xpProgress / xpNeeded) * 100, 100);
  const acceptedFriends = friends.filter((f) => f.status === "accepted");

  const logout = useAppStore((s) => s.logout);

  const signOut = async () => {
    await logout();
    await clearSession();
    router.replace("/(auth)/language");
  };

  const stats = [
    { label: "Streak", value: `${streak}d`, Icon: Flame, color: theme.color.orange, bg: "#FFF7ED" },
    { label: "Modules", value: String(completedModules.length), Icon: CheckCircle2, color: theme.color.primary, bg: theme.color.mint },
    { label: "Badges", value: String(badges.length), Icon: Trophy, color: theme.color.warningDark, bg: theme.color.cream },
    { label: "Friends", value: String(acceptedFriends.length), Icon: Users, color: theme.color.info, bg: theme.color.infoSurface },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
          <Text className="text-[28px] font-bold text-foreground">My Profile</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings" as any)}
            className="w-10 h-10 rounded-2xl bg-card border border-border items-center justify-center"
          >
            <Settings size={20} color={theme.color.muted} />
          </TouchableOpacity>
        </View>

        {/* Profile card */}
        <View className="mx-4">
          <Card className="overflow-hidden p-0">
            <View className="h-24" style={{ backgroundColor: theme.color.primary }} />
            <View className="px-5 pb-5">
              <View style={{ marginTop: -32 }}>
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center border-4 border-white"
                  style={{ backgroundColor: theme.color.primaryLight }}
                >
                  <Text className="text-[28px]">👩</Text>
                </View>
              </View>

              <View className="flex-row items-start justify-between mt-2">
                <View>
                  <Text className="text-[20px] font-bold text-foreground">
                    {displayName}
                  </Text>
                  <Text className="text-[13px] text-muted-foreground">
                    @{username}
                  </Text>
                </View>
                <View
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: theme.color.mint }}
                >
                  <Text
                    className="text-[12px] font-bold"
                    style={{ color: theme.color.primary }}
                  >
                    Level {level}
                  </Text>
                </View>
              </View>

              <View className="mt-4">
                <View className="flex-row justify-between mb-1.5">
                  <View className="flex-row items-center">
                    <Star size={13} color={theme.color.warning} fill={theme.color.warning} />
                    <Text className="text-[12px] font-semibold text-muted-foreground ml-1">
                      {xp} XP
                    </Text>
                  </View>
                  <Text className="text-[11px] text-muted-foreground">
                    {xpProgress}/{xpNeeded} to Level {level + 1}
                  </Text>
                </View>
                <ProgressBar value={progressPct} />
              </View>
            </View>
          </Card>
        </View>

        {/* Stats */}
        <View className="flex-row mx-4 mt-3 gap-3">
          {stats.map((s) => (
            <Card key={s.label} elevation="sm" className="flex-1 items-center py-3">
              <View
                className="w-8 h-8 rounded-xl items-center justify-center mb-1"
                style={{ backgroundColor: s.bg }}
              >
                <s.Icon size={16} color={s.color} />
              </View>
              <Text className="text-[18px] font-bold text-foreground">
                {s.value}
              </Text>
              <Text className="text-[10px] text-muted-foreground mt-0.5">
                {s.label}
              </Text>
            </Card>
          ))}
        </View>

        {/* Badges */}
        <Text className="text-[12px] font-bold text-muted-foreground mt-6 mb-2 ml-5 tracking-wide">
          MY BADGES
        </Text>
        <View className="mx-4">
          <Card className="px-5 py-5">
            {badges.length === 0 ? (
              <View className="items-center py-6">
                <Text className="text-[36px] mb-3">🎯</Text>
                <Text className="text-[15px] font-semibold text-foreground">
                  No badges yet
                </Text>
                <Text className="text-[13px] text-muted-foreground mt-1 text-center">
                  Complete a lesson to earn your first badge!
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {badges.map((b) => (
                  <View
                    key={b.code}
                    className="items-center rounded-2xl px-4 py-4"
                    style={{ backgroundColor: theme.color.mint, minWidth: "45%", flex: 1 }}
                  >
                    <Text className="text-[32px]">{BADGE_ICONS[b.code] ?? "🏆"}</Text>
                    <Text className="text-[13px] font-bold text-foreground mt-2 text-center">
                      {b.name}
                    </Text>
                    <Text className="text-[11px] text-muted-foreground mt-0.5 text-center">
                      {b.description}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Star size={11} color={theme.color.warning} fill={theme.color.warning} />
                      <Text
                        className="text-[11px] font-bold ml-1"
                        style={{ color: theme.color.primary }}
                      >
                        +{b.xpReward} XP
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        {/* Leaderboard shortcut */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/screens/leaderboard")}
          >
            <Card elevation="sm" className="px-5 py-4 flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: theme.color.cream }}
              >
                <Trophy size={20} color={theme.color.warningDark} />
              </View>
              <Text className="text-[15px] font-semibold text-foreground flex-1">
                View Leaderboard
              </Text>
              <ChevronRight size={18} color={theme.color.muted} />
            </Card>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity onPress={signOut} className="items-center py-5 mt-2">
          <Text className="text-[14px] font-semibold" style={{ color: theme.color.destructive }}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
