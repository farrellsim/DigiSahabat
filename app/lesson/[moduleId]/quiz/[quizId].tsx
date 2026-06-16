import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Check, X, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react-native";
import { MODULES } from "../../../../src/data/modules";
import { useAppStore } from "../../../../src/store/app.store";
import { theme } from "../../../../src/constants/theme";

export default function Quiz() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const completeModule = useAppStore((s) => s.completeModule);

  const mod = MODULES.find((m) => m.id === moduleId) ?? MODULES[0];
  const questions = mod.quiz;

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const question = questions[currentQ];
  const isCorrect = selected === question?.correctOptionId;
  const isLast = currentQ === questions.length - 1;

  const handleSelect = (optionId: string) => {
    if (answered) return;
    setSelected(optionId);
    setAnswered(true);
    Haptics.notificationAsync(
      optionId === question.correctOptionId
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
  };

  const handleNext = async () => {
    if (isLast) {
      if (submitting) return;
      setSubmitting(true);
      // Awards XP + badge via the backend (with local fallback).
      await completeModule(mod.id);
      router.replace(`/lesson/${mod.id}/complete` as any);
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (!question) return null;

  const optionStyle = (optId: string) => {
    if (!answered) return { backgroundColor: theme.color.card, borderColor: theme.color.border };
    if (optId === question.correctOptionId)
      return { backgroundColor: theme.color.successSurface, borderColor: theme.color.primaryLight };
    if (optId === selected)
      return { backgroundColor: theme.color.destructiveSurface, borderColor: "#FCA5A5" };
    return { backgroundColor: theme.color.card, borderColor: theme.color.border };
  };

  const optionTextColor = (optId: string) => {
    if (!answered) return theme.color.foreground;
    if (optId === question.correctOptionId) return theme.color.successDark;
    if (optId === selected) return "#991B1B";
    return theme.color.muted;
  };

  return (
    <SafeAreaView className="flex-1 bg-card" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-3 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center mr-3 bg-muted"
        >
          <ChevronLeft size={20} color={theme.color.foreground} />
        </TouchableOpacity>
        <Text className="text-[15px] font-semibold text-foreground flex-1">
          Quiz: {mod.title}
        </Text>
        <Text className="text-[12px] text-muted-foreground">
          {currentQ + 1}/{questions.length}
        </Text>
      </View>

      <View className="h-1" style={{ backgroundColor: theme.color.mutedSurface }}>
        <View
          className="h-1"
          style={{
            width: `${((currentQ + 1) / questions.length) * 100}%`,
            backgroundColor: theme.color.primaryLight,
          }}
        />
      </View>

      <View className="flex-1 px-6 pt-8">
        {/* Question */}
        <View className="rounded-3xl px-5 py-6 mb-6" style={{ backgroundColor: theme.color.mint }}>
          <Text className="text-[11px] font-bold mb-2 tracking-wide" style={{ color: theme.color.primaryLight }}>
            QUESTION {currentQ + 1}
          </Text>
          <Text className="text-[20px] font-bold text-foreground leading-7">
            {question.question}
          </Text>
        </View>

        {/* Options */}
        {question.options.map((opt) => {
          const showCorrect = answered && opt.id === question.correctOptionId;
          const showWrong = answered && opt.id === selected && !isCorrect;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => handleSelect(opt.id)}
              disabled={answered}
              activeOpacity={0.9}
              className="rounded-2xl border px-5 py-4 mb-3 flex-row items-center"
              style={optionStyle(opt.id)}
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: showCorrect
                    ? theme.color.primaryLight
                    : showWrong
                      ? "#FCA5A5"
                      : theme.color.mutedSurface,
                }}
              >
                {showCorrect ? (
                  <Check size={16} color="#fff" />
                ) : showWrong ? (
                  <X size={16} color="#fff" />
                ) : (
                  <Text className="text-[13px] font-bold" style={{ color: theme.color.muted }}>
                    {opt.id}
                  </Text>
                )}
              </View>
              <Text className="text-[15px] font-semibold flex-1" style={{ color: optionTextColor(opt.id) }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Feedback */}
        {answered && (
          <View
            className="rounded-2xl px-5 py-4 mt-2 flex-row items-start"
            style={{ backgroundColor: isCorrect ? theme.color.successSurface : theme.color.destructiveSurface }}
          >
            {isCorrect ? (
              <CheckCircle2 size={20} color={theme.color.successDark} />
            ) : (
              <AlertCircle size={20} color="#991B1B" />
            )}
            <Text
              className="text-[14px] ml-2 flex-1 leading-5 font-medium"
              style={{ color: isCorrect ? theme.color.successDark : "#991B1B" }}
            >
              {isCorrect ? question.correctFeedback : question.incorrectFeedback}
            </Text>
          </View>
        )}
      </View>

      {/* Next */}
      {answered && (
        <View className="px-6 pb-6">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNext}
            disabled={submitting}
            className="rounded-2xl py-4 items-center flex-row justify-center"
            style={{ backgroundColor: theme.color.primary, opacity: submitting ? 0.7 : 1 }}
          >
            <Text className="text-white text-[16px] font-bold mr-2">
              {submitting ? "Saving..." : isLast ? "Finish Quiz" : "Next Question"}
            </Text>
            {!submitting && <ArrowRight size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
