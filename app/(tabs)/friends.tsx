import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { AtSign, UserPlus, User, Star, Clock } from "lucide-react-native";
import { useAppStore } from "../../src/store/app.store";
import { leaderboardApi, type LeaderboardEntry } from "../../src/services/backend";
import { Card } from "../../src/components/ui/Card";
import { theme } from "../../src/constants/theme";

export default function Friends() {
  const { friends, addFriend, acceptFriend, xp, username, displayName, hydrate } =
    useAppStore();
  const [searchText, setSearchText] = useState("");
  const [tab, setTab] = useState<"friends" | "leaderboard">("friends");
  const [board, setBoard] = useState<LeaderboardEntry[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      hydrate();
      leaderboardApi
        .weekly()
        .then((r) => setBoard(r.leaderboard))
        .catch(() => setBoard(null));
    }, [hydrate])
  );

  const accepted = friends.filter((f) => f.status === "accepted");
  const pending = friends.filter((f) => f.status === "pending");

  const handleAdd = async () => {
    const uname = searchText.trim().toLowerCase();
    if (!uname) return;
    const ok = await addFriend(uname);
    if (ok) {
      Alert.alert("Friend Request Sent!", `Request sent to @${uname}.`);
      setSearchText("");
    } else {
      Alert.alert(
        "Could not add friend",
        `@${uname} may not exist, is already in your list, or the server is unavailable.`
      );
    }
  };

  // Prefer live backend leaderboard; fall back to a local view.
  const leaderboard =
    board?.map((e) => ({
      username: e.user.username,
      displayName: e.user.displayName,
      xp: e.xp,
      isMe: e.user.username === username,
    })) ??
    [
      { username, displayName, xp, isMe: true },
      ...accepted.map((f) => ({
        username: f.username,
        displayName: f.displayName,
        xp: f.xp,
        isMe: false,
      })),
    ].sort((a, b) => b.xp - a.xp);

  const rankEmoji = (i: number) =>
    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-[28px] font-bold text-foreground">Friends</Text>
          <Text className="text-[14px] text-muted-foreground mt-1">
            Connect with other learners
          </Text>
        </View>

        {/* Segmented control */}
        <View
          className="mx-4 flex-row rounded-2xl p-1"
          style={{ backgroundColor: theme.color.mutedSurface }}
        >
          {(["friends", "leaderboard"] as const).map((t) => {
            const active = tab === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                className="flex-1 rounded-xl py-2.5 items-center"
                style={{
                  backgroundColor: active ? theme.color.card : "transparent",
                  ...(active
                    ? {
                        shadowColor: "#0F172A",
                        shadowOpacity: 0.06,
                        shadowRadius: 4,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 1,
                      }
                    : {}),
                }}
              >
                <Text
                  className="text-[14px] font-semibold capitalize"
                  style={{
                    color: active ? theme.color.foreground : theme.color.muted,
                  }}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {tab === "friends" ? (
          <>
            {/* Add friend */}
            <Text className="text-[12px] font-bold text-muted-foreground mt-5 mb-2 ml-5 tracking-wide">
              ADD BY USERNAME
            </Text>
            <View className="mx-4 flex-row gap-3">
              <View className="flex-1 flex-row items-center bg-card border border-border rounded-2xl px-4 py-3">
                <AtSign size={18} color={theme.color.muted} />
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Enter username (e.g. pakdin)"
                  placeholderTextColor={theme.color.muted}
                  className="ml-2 flex-1 text-[15px] text-foreground"
                  autoCapitalize="none"
                  onSubmitEditing={handleAdd}
                />
              </View>
              <TouchableOpacity
                onPress={handleAdd}
                className="w-12 h-12 rounded-2xl items-center justify-center"
                style={{ backgroundColor: theme.color.primary }}
              >
                <UserPlus size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text className="text-[11px] text-muted-foreground mt-2 ml-5">
              Try: pakdin · siti01 · uncleman
            </Text>

            {/* Pending */}
            {pending.length > 0 && (
              <>
                <Text className="text-[12px] font-bold text-muted-foreground mt-5 mb-2 ml-5 tracking-wide">
                  PENDING ({pending.length})
                </Text>
                <View className="mx-4">
                  {pending.map((f) => (
                    <Card
                      key={f.username}
                      elevation="sm"
                      className="px-4 py-4 mb-3 flex-row items-center"
                      style={{ borderColor: "#FDE68A" }}
                    >
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: theme.color.warningSurface }}
                      >
                        <Clock size={18} color={theme.color.warningDark} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-[15px] font-semibold text-foreground">
                          {f.displayName}
                        </Text>
                        <Text className="text-[12px] text-muted-foreground">
                          @{f.username} ·{" "}
                          {f.incoming ? "Wants to add you" : "Request sent"}
                        </Text>
                      </View>
                      {f.incoming ? (
                        <TouchableOpacity
                          onPress={() => acceptFriend(f.username)}
                          className="px-3.5 py-2 rounded-xl"
                          style={{ backgroundColor: theme.color.mint }}
                        >
                          <Text
                            className="text-[12px] font-bold"
                            style={{ color: theme.color.primary }}
                          >
                            Accept
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <Text className="text-[12px] text-muted-foreground font-medium">
                          Pending
                        </Text>
                      )}
                    </Card>
                  ))}
                </View>
              </>
            )}

            {/* Friends */}
            <Text className="text-[12px] font-bold text-muted-foreground mt-5 mb-2 ml-5 tracking-wide">
              FRIENDS ({accepted.length})
            </Text>
            <View className="mx-4">
              {accepted.map((f) => (
                <Card
                  key={f.username}
                  elevation="sm"
                  className="px-4 py-4 mb-3 flex-row items-center"
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: theme.color.mint }}
                  >
                    <User size={18} color={theme.color.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-foreground">
                      {f.displayName}
                    </Text>
                    <Text className="text-[12px] text-muted-foreground">
                      @{f.username}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Star size={13} color={theme.color.warning} fill={theme.color.warning} />
                    <Text className="text-[13px] font-bold text-foreground ml-1">
                      {f.xp} XP
                    </Text>
                  </View>
                </Card>
              ))}
              {accepted.length === 0 && (
                <View className="items-center py-8">
                  <Text className="text-[36px] mb-3">👥</Text>
                  <Text className="text-[16px] font-semibold text-foreground">
                    No friends yet
                  </Text>
                  <Text className="text-[13px] text-muted-foreground mt-1 text-center">
                    Add friends above to learn together!
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          /* Leaderboard */
          <>
            <Text className="text-[12px] font-bold text-muted-foreground mt-5 mb-2 ml-5 tracking-wide">
              WEEKLY RANKING
            </Text>
            <View className="mx-4">
              {leaderboard.map((entry, idx) => {
                const isMe = entry.isMe;
                return (
                  <View
                    key={entry.username + idx}
                    className="rounded-2xl px-4 py-4 mb-3 flex-row items-center border"
                    style={{
                      backgroundColor: isMe ? theme.color.mint : theme.color.card,
                      borderColor: isMe ? theme.color.primaryLight : theme.color.border,
                    }}
                  >
                    <Text className="text-[20px] w-9 text-center">
                      {rankEmoji(idx)}
                    </Text>
                    <View
                      className="w-9 h-9 rounded-full items-center justify-center mr-3"
                      style={{
                        backgroundColor: isMe
                          ? theme.color.successSurface
                          : theme.color.mutedSurface,
                      }}
                    >
                      <User
                        size={16}
                        color={isMe ? theme.color.primary : theme.color.muted}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-[15px] font-bold"
                        style={{ color: isMe ? theme.color.primary : theme.color.foreground }}
                      >
                        {entry.displayName}
                        {isMe ? " (You)" : ""}
                      </Text>
                      <Text className="text-[12px] text-muted-foreground">
                        @{entry.username}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Star size={14} color={theme.color.warning} fill={theme.color.warning} />
                      <Text className="text-[15px] font-bold text-foreground ml-1">
                        {entry.xp}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <View
                className="mt-1 rounded-2xl px-5 py-4"
                style={{ backgroundColor: theme.color.mint }}
              >
                <Text className="text-[12px] leading-5" style={{ color: "#374151" }}>
                  Leaderboard resets every Monday. Keep learning to climb the
                  ranks!
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
