import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft, Star, User } from "lucide-react-native";
import { useAppStore } from "../../src/store/app.store";
import { leaderboardApi, type LeaderboardEntry } from "../../src/services/backend";
import { theme } from "../../src/constants/theme";

const SEED_USERS = [
  { username: "pakdin", displayName: "Pak Din", xp: 95, badges: 1 },
  { username: "siti01", displayName: "Siti", xp: 80, badges: 1 },
  { username: "uncleman", displayName: "Uncle Man", xp: 60, badges: 0 },
];

export default function Leaderboard() {
  const { displayName, username, xp, badges } = useAppStore();
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    leaderboardApi
      .weekly()
      .then((r) => setBoard(r.leaderboard))
      .catch(() => setBoard(null));
  }, []);

  const allEntries = board
    ? board.map((e) => ({
        username: e.user.username,
        displayName: e.user.displayName,
        xp: e.xp,
        badges: e.badgeCount,
        isMe: e.user.username === username,
      }))
    : [
        { username, displayName, xp, badges: badges.length, isMe: true },
        ...SEED_USERS.map((u) => ({ ...u, isMe: false })),
      ].sort((a, b) => b.xp - a.xp);

  const rankEmoji = (i: number) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);

  // podium order: 2nd, 1st, 3rd
  const podium = [allEntries[1], allEntries[0], allEntries[2]].filter(Boolean);
  const podiumHeights = [86, 112, 70];
  const podiumRank = [1, 0, 2];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-3 bg-card border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center mr-3 bg-muted"
        >
          <ChevronLeft size={20} color={theme.color.foreground} />
        </TouchableOpacity>
        <Text className="text-[20px] font-bold text-foreground">Leaderboard</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Podium */}
        <View
          className="px-6 pt-6 pb-8"
          style={{ backgroundColor: theme.color.primary }}
        >
          <Text className="text-[12px] font-bold text-center mb-5 text-white/60 tracking-wide">
            THIS WEEK&apos;S TOP LEARNERS
          </Text>
          <View className="flex-row items-end justify-center gap-3">
            {podium.map((entry, i) => (
              <View key={entry.username} className="items-center flex-1">
                <Text className="text-[26px] mb-1">{rankEmoji(podiumRank[i])}</Text>
                <Text
                  className="text-white text-[12px] font-bold text-center"
                  numberOfLines={1}
                >
                  {entry.displayName}
                </Text>
                <View className="flex-row items-center mt-1 mb-2">
                  <Star size={11} color={theme.color.warning} fill={theme.color.warning} />
                  <Text className="text-[11px] font-semibold ml-1 text-white/85">
                    {entry.xp} XP
                  </Text>
                </View>
                <View
                  className="w-full rounded-t-2xl items-center justify-start pt-2"
                  style={{
                    height: podiumHeights[i],
                    backgroundColor:
                      i === 1 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.14)",
                  }}
                >
                  <View
                    className="w-9 h-9 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: entry.isMe
                        ? theme.color.warning
                        : "rgba(255,255,255,0.25)",
                    }}
                  >
                    <User size={16} color="#fff" />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Full list */}
        <Text className="text-[12px] font-bold text-muted-foreground mt-5 mb-2 ml-5 tracking-wide">
          FULL RANKING
        </Text>
        <View className="px-4">
          {allEntries.map((entry, idx) => (
            <View
              key={entry.username}
              className="rounded-2xl px-4 py-4 mb-3 flex-row items-center border"
              style={{
                backgroundColor: entry.isMe ? theme.color.mint : theme.color.card,
                borderColor: entry.isMe ? theme.color.primaryLight : theme.color.border,
              }}
            >
              <Text className="text-[20px] w-10 text-center">
                {rankEmoji(idx)}
              </Text>
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: entry.isMe
                    ? theme.color.successSurface
                    : theme.color.mutedSurface,
                }}
              >
                <User size={16} color={entry.isMe ? theme.color.primary : theme.color.muted} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[15px] font-bold"
                  style={{ color: entry.isMe ? theme.color.primary : theme.color.foreground }}
                >
                  {entry.displayName}
                  {entry.isMe ? " (You)" : ""}
                </Text>
                <View className="flex-row items-center mt-0.5 gap-3">
                  <Text className="text-[11px] text-muted-foreground">
                    @{entry.username}
                  </Text>
                  {entry.badges > 0 && (
                    <Text className="text-[11px] text-muted-foreground">
                      🏆 {entry.badges}
                    </Text>
                  )}
                </View>
              </View>
              <View className="flex-row items-center">
                <Star size={14} color={theme.color.warning} fill={theme.color.warning} />
                <Text className="text-[16px] font-bold text-foreground ml-1">
                  {entry.xp}
                </Text>
              </View>
            </View>
          ))}

          <View
            className="mt-1 rounded-2xl px-5 py-4"
            style={{ backgroundColor: theme.color.mint }}
          >
            <Text className="text-[12px] leading-5" style={{ color: "#374151" }}>
              Leaderboard resets every Monday. Keep learning to earn XP and climb
              the ranks!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
