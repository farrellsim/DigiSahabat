import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Clock,
  Layers,
  Star,
  Check,
  HelpCircle,
  CheckCircle2,
} from "lucide-react-native";
import { MODULES } from "../../../src/data/modules";
import { useAppStore } from "../../../src/store/app.store";
import { theme } from "../../../src/constants/theme";

export default function ModuleOverview() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const { completedLessons, completedModules } = useAppStore();

  const mod = MODULES.find((m) => m.id === moduleId) ?? MODULES[0];
  const isModuleDone = completedModules.includes(mod.id);

  const steps = [
    ...mod.lessons.map((l, i) => ({
      id: l.id,
      label: `Part ${i + 1}: ${l.title}`,
      type: "lesson" as const,
      done: completedLessons.includes(l.id),
    })),
    { id: "quiz", label: "Quiz", type: "quiz" as const, done: isModuleDone },
    { id: "badge", label: "Badge", type: "badge" as const, done: isModuleDone },
  ];

  const firstIncomplete = steps.findIndex((s) => !s.done);
  const nextStep = firstIncomplete === -1 ? steps[0] : steps[firstIncomplete];

  const handleStart = () => {
    if (nextStep.type === "lesson") {
      router.push(`/lesson/${mod.id}/content/${nextStep.id}` as any);
    } else if (nextStep.type === "quiz") {
      router.push(`/lesson/${mod.id}/quiz/quiz-1` as any);
    } else {
      router.push(`/lesson/${mod.id}/complete` as any);
    }
  };

  const meta = [
    { Icon: Clock, label: `${mod.estimatedMinutes} min` },
    { Icon: Layers, label: `${mod.lessons.length} lessons` },
    { Icon: Star, label: `+${mod.xpReward} XP` },
  ];

  return (
    <SafeAreaView className="flex-1 bg-card" edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View className="px-6 pt-3 pb-8" style={{ backgroundColor: theme.color.primary }}>
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-6"
          >
            <ChevronLeft size={22} color="#fff" />
            <Text className="text-[14px] font-medium ml-1 text-white/85">
              Learning Path
            </Text>
          </TouchableOpacity>

          <View
            className="w-20 h-20 rounded-3xl items-center justify-center mb-4"
            style={{ backgroundColor: "rgba(255,255,255,0.18)" }}
          >
            <Text className="text-[40px]">{mod.imageEmoji}</Text>
          </View>

          <Text className="text-[26px] font-bold text-white">{mod.title}</Text>
          <Text className="text-[14px] mt-2 leading-5 text-white/80">
            {mod.description}
          </Text>

          <View className="flex-row mt-5 gap-3">
            {meta.map((m) => (
              <View
                key={m.label}
                className="flex-row items-center px-3 py-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
              >
                <m.Icon size={13} color="rgba(255,255,255,0.85)" />
                <Text className="text-[12px] ml-1.5 text-white/90">{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stepper */}
        <Text className="text-[12px] font-bold text-muted-foreground mt-6 mb-3 ml-6 tracking-wide">
          YOUR PROGRESS
        </Text>
        <View className="mx-6">
          {steps.map((step, idx) => {
            const isNext = nextStep.id === step.id && !step.done;
            return (
              <View key={step.id} className="flex-row items-start">
                <View className="items-center mr-4" style={{ width: 32 }}>
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: step.done
                        ? theme.color.primary
                        : isNext
                          ? theme.color.mint
                          : theme.color.mutedSurface,
                      borderWidth: isNext ? 2 : 0,
                      borderColor: theme.color.primaryLight,
                    }}
                  >
                    {step.done ? (
                      <Check size={16} color="#fff" />
                    ) : step.type === "badge" ? (
                      <Text className="text-[14px]">🏆</Text>
                    ) : step.type === "quiz" ? (
                      <HelpCircle size={16} color={theme.color.muted} />
                    ) : (
                      <Text
                        className="text-[12px] font-bold"
                        style={{ color: isNext ? theme.color.primary : theme.color.muted }}
                      >
                        {idx + 1}
                      </Text>
                    )}
                  </View>
                  {idx < steps.length - 1 && (
                    <View
                      className="w-0.5 h-8"
                      style={{ backgroundColor: step.done ? theme.color.primaryLight : theme.color.border }}
                    />
                  )}
                </View>

                <View className="flex-1 pb-4">
                  <Text
                    className="text-[14px] font-semibold"
                    style={{
                      color: step.done
                        ? theme.color.primary
                        : isNext
                          ? theme.color.foreground
                          : theme.color.muted,
                    }}
                  >
                    {step.label}
                  </Text>
                  {step.done && (
                    <Text className="text-[11px] text-muted-foreground mt-0.5">
                      Completed
                    </Text>
                  )}
                  {isNext && (
                    <Text className="text-[11px] mt-0.5 font-medium" style={{ color: theme.color.primaryLight }}>
                      Up next
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* What you will learn */}
        <Text className="text-[12px] font-bold text-muted-foreground mt-2 mb-3 ml-6 tracking-wide">
          WHAT YOU WILL LEARN
        </Text>
        <View className="mx-6">
          <View className="rounded-2xl px-5 py-4" style={{ backgroundColor: theme.color.mint }}>
            {mod.lessons.map((l) => (
              <View key={l.id} className="flex-row items-start mb-3 last:mb-0">
                <CheckCircle2 size={18} color={theme.color.primary} />
                <Text className="text-[14px] text-foreground ml-2 flex-1 leading-5">
                  {l.title}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View className="mx-6 mt-6">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleStart}
            className="rounded-2xl py-4 items-center"
            style={{ backgroundColor: theme.color.primary }}
          >
            <Text className="text-white text-[16px] font-bold">
              {isModuleDone
                ? "Review Module"
                : firstIncomplete === 0
                  ? "Start Module"
                  : "Continue"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
