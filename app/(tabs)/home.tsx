import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import {
  Star,
  Flame,
  Award,
  ArrowRight,
  Bot,
  CloudDownload,
  Trophy,
  Lightbulb,
  Users,
  ChevronRight,
} from "lucide-react-native";
import { useAppStore } from "../../src/store/app.store";
import { DAILY_TIPS, MODULES } from "../../src/data/modules";
import { Card } from "../../src/components/ui/Card";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { theme, shadow } from "../../src/constants/theme";

export default function Home() {
  const { displayName, xp, level, streak, completedModules, badges } =
    useAppStore();
  const hydrate = useAppStore((s) => s.hydrate);
  const [tip, setTip] = useState(DAILY_TIPS[0]);

  useEffect(() => {
    setTip(DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length]);
  }, []);

  // Refresh XP, badges, and friends from the backend whenever Home is focused.
  useFocusEffect(
    useCallback(() => {
      hydrate();
    }, [hydrate])
  );

  const activeModule = MODULES[0];
  const lessonCount = activeModule.lessons.length;
  const completedCount = completedModules.includes(activeModule.id)
    ? lessonCount
    : 0;
  const progressPct = Math.round((completedCount / lessonCount) * 100);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    { label: "XP Points", value: String(xp), Icon: Star, color: theme.color.warning },
    { label: "Day Streak", value: `${streak}`, Icon: Flame, color: theme.color.orange },
    { label: "Level", value: String(level), Icon: Award, color: "#C4B5FD" },
  ];

  const quickActions = [
    {
      label: "DigiBuddy",
      sub: "Ask AI assistant",
      Icon: Bot,
      bg: theme.color.mint,
      color: theme.color.primary,
      onPress: () => router.push("/(tabs)/digibuddy" as any),
    },
    {
      label: "Download",
      sub: "Offline modules",
      Icon: CloudDownload,
      bg: theme.color.mint,
      color: theme.color.primary,
      onPress: () => router.push("/download/tech-devices" as any),
    },
    {
      label: "Badges",
      sub: `${badges.length} earned`,
      Icon: Trophy,
      bg: theme.color.cream,
      color: theme.color.warningDark,
      onPress: () => router.push("/(tabs)/profile" as any),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting hero */}
        <View
          className="mx-4 mt-4 rounded-3xl px-6 py-6"
          style={{ backgroundColor: theme.color.primary, ...shadow.md }}
        >
          <Text className="text-[13px] font-medium text-white/70">
            {greeting()},
          </Text>
          <Text className="text-[25px] font-bold text-white mt-0.5">
            {displayName} 👋
          </Text>

          <View className="flex-row mt-5 gap-3">
            {stats.map((s) => (
              <View
                key={s.label}
                className="flex-1 rounded-2xl px-3 py-3"
                style={{ backgroundColor: "rgba(255,255,255,0.13)" }}
              >
                <Text className="text-[10px] font-semibold text-white/65">
                  {s.label}
                </Text>
                <View className="flex-row items-center mt-1.5">
                  <s.Icon size={15} color={s.color} fill={s.color} />
                  <Text className="text-[19px] font-bold text-white ml-1.5">
                    {s.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Continue learning */}
        <Text className="text-[12px] font-bold text-muted-foreground mt-6 mb-2 ml-5 tracking-wide">
          CONTINUE LEARNING
        </Text>
        <View className="mx-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(`/lesson/${activeModule.id}` as any)}
          >
            <Card className="px-5 py-5">
              <View className="flex-row items-center">
                <View
                  className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                  style={{ backgroundColor: theme.color.mint }}
                >
                  <Text className="text-[28px]">{activeModule.imageEmoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[16px] font-bold text-foreground">
                    {activeModule.title}
                  </Text>
                  <Text className="text-[12px] text-muted-foreground mt-0.5">
                    {activeModule.estimatedMinutes} min · {activeModule.difficulty}
                  </Text>
                </View>
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: theme.color.primary }}
                >
                  <ArrowRight size={18} color="#fff" />
                </View>
              </View>

              <View className="mt-4">
                <View className="flex-row justify-between mb-1.5">
                  <Text className="text-[12px] text-muted-foreground">
                    {completedCount} of {lessonCount} lessons done
                  </Text>
                  <Text
                    className="text-[12px] font-bold"
                    style={{ color: theme.color.primary }}
                  >
                    {progressPct}%
                  </Text>
                </View>
                <ProgressBar value={progressPct} />
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <Text className="text-[12px] font-bold text-muted-foreground mt-6 mb-2 ml-5 tracking-wide">
          QUICK ACTIONS
        </Text>
        <View className="flex-row mx-4 gap-3">
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.label}
              activeOpacity={0.9}
              onPress={a.onPress}
              className="flex-1"
            >
              <Card elevation="sm" className="px-4 py-4">
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mb-2.5"
                  style={{ backgroundColor: a.bg }}
                >
                  <a.Icon size={20} color={a.color} />
                </View>
                <Text className="text-[14px] font-bold text-foreground">
                  {a.label}
                </Text>
                <Text className="text-[11px] text-muted-foreground mt-0.5">
                  {a.sub}
                </Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily tip */}
        <View
          className="mx-4 mt-6 rounded-2xl px-5 py-4 flex-row items-start"
          style={{ backgroundColor: theme.color.cream }}
        >
          <View
            className="w-9 h-9 rounded-xl items-center justify-center mr-3 mt-0.5"
            style={{ backgroundColor: theme.color.warningSurface }}
          >
            <Lightbulb size={18} color={theme.color.warningDark} />
          </View>
          <View className="flex-1">
            <Text
              className="text-[11px] font-bold mb-1 tracking-wide"
              style={{ color: theme.color.warningDark }}
            >
              DAILY TIP
            </Text>
            <Text className="text-[14px] leading-5" style={{ color: "#92400E" }}>
              {tip}
            </Text>
          </View>
        </View>

        {/* Friends & leaderboard */}
        <View className="mx-4 mt-4">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(tabs)/friends" as any)}
          >
            <Card elevation="sm" className="px-5 py-4 flex-row items-center">
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: theme.color.mint }}
              >
                <Users size={20} color={theme.color.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-foreground">
                  Friends & Leaderboard
                </Text>
                <Text className="text-[12px] text-muted-foreground mt-0.5">
                  See how you rank this week
                </Text>
              </View>
              <ChevronRight size={18} color={theme.color.muted} />
            </Card>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
