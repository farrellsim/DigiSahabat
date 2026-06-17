import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  Lock,
  Clock,
  Layers,
  Star,
  CloudDownload,
  Share2,
  ChevronRight,
} from "lucide-react-native";
import { useAppStore } from "../../src/store/app.store";
import { MODULES } from "../../src/data/modules";
import { Card } from "../../src/components/ui/Card";
import { Pill } from "../../src/components/ui/Pill";
import { ProgressBar } from "../../src/components/ui/ProgressBar";
import { theme } from "../../src/constants/theme";

export default function Learn() {
  const { completedModules } = useAppStore();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-5 pt-3 pb-4">
          <Text className="text-[30px] font-extrabold text-foreground">
            Learning Path
          </Text>
          <Text className="text-[16px] text-muted-foreground mt-1">
            Start your digital skills journey
          </Text>
        </View>

        {/* Modules */}
        <View className="px-4">
          {MODULES.map((mod) => {
            const isDone = completedModules.includes(mod.id);
            const isLocked = mod.isLocked;

            return (
              <Card
                key={mod.id}
                className="mb-4 overflow-hidden"
                style={{ opacity: isLocked ? 0.7 : 1 }}
              >
                {/* Header */}
                <View
                  className="px-5 pt-5 pb-4"
                  style={{
                    backgroundColor: isLocked
                      ? theme.color.background
                      : isDone
                        ? theme.color.mint
                        : theme.color.card,
                  }}
                >
                  <View className="flex-row items-start">
                    <View
                      className="w-16 h-16 rounded-2xl items-center justify-center mr-4"
                      style={{
                        backgroundColor: isLocked
                          ? theme.color.mutedSurface
                          : isDone
                            ? theme.color.successSurface
                            : theme.color.mint,
                      }}
                    >
                      {isLocked ? (
                        <Lock size={26} color={theme.color.muted} />
                      ) : (
                        <Text className="text-[32px]">{mod.imageEmoji}</Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <View className="flex-row mb-1.5">
                        <Pill
                          label={
                            isDone
                              ? "COMPLETED"
                              : isLocked
                                ? "COMING SOON"
                                : mod.difficulty.toUpperCase()
                          }
                          tone={isDone ? "success" : isLocked ? "muted" : "primary"}
                        />
                      </View>
                      <Text className="text-[18px] font-bold text-foreground">
                        {mod.title}
                      </Text>
                      <Text className="text-[15px] text-muted-foreground mt-1 leading-[22px]">
                        {mod.description}
                      </Text>
                    </View>
                  </View>

                  {/* Meta */}
                  <View className="flex-row items-center mt-4 gap-4">
                    <View className="flex-row items-center">
                      <Clock size={16} color={theme.color.muted} />
                      <Text className="text-[14px] text-muted-foreground ml-1.5">
                        {mod.estimatedMinutes} min
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Layers size={16} color={theme.color.muted} />
                      <Text className="text-[14px] text-muted-foreground ml-1.5">
                        {mod.lessons.length} lessons
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Star size={16} color={theme.color.muted} />
                      <Text className="text-[14px] text-muted-foreground ml-1.5">
                        +{mod.xpReward} XP
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {!isLocked && (
                  <View className="px-5 pt-3 pb-5">
                    <View className="mb-4">
                      <ProgressBar value={isDone ? 100 : 0} height={6} />
                    </View>
                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push(`/lesson/${mod.id}` as any)}
                        accessibilityRole="button"
                        className="flex-1 rounded-2xl items-center justify-center"
                        style={{ backgroundColor: theme.color.primary, minHeight: 54 }}
                      >
                        <Text className="text-white text-[17px] font-bold">
                          {isDone ? "Review Module" : "Start Module"}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => router.push(`/download/${mod.id}` as any)}
                        accessibilityRole="button"
                        accessibilityLabel="Download module"
                        className="w-[54px] h-[54px] rounded-2xl border border-border bg-card items-center justify-center"
                      >
                        <CloudDownload size={22} color={theme.color.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Card>
            );
          })}
        </View>

        {/* Share modules nearby — links to the real P2P discovery flow */}
        <View className="mx-4 mt-1">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/screens/p2p-discovery")}
          >
            <View
              className="rounded-2xl flex-row items-center px-5 py-4"
              style={{ backgroundColor: theme.color.mint }}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: theme.color.successSurface }}
              >
                <Share2 size={22} color={theme.color.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-bold text-foreground">
                  Share Modules Nearby
                </Text>
                <Text className="text-[14px] text-muted-foreground mt-0.5">
                  Send to another phone — no internet needed
                </Text>
              </View>
              <ChevronRight size={22} color={theme.color.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
