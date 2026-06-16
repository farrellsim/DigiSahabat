import * as Speech from "expo-speech";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Volume2, Lightbulb, ArrowRight } from "lucide-react-native";
import { MODULES } from "../../../../src/data/modules";
import { useAppStore } from "../../../../src/store/app.store";
import { theme } from "../../../../src/constants/theme";

export default function LessonContent() {
  const { moduleId, lessonId } = useLocalSearchParams<{
    moduleId: string;
    lessonId: string;
  }>();
  const { completeLesson } = useAppStore();

  const mod = MODULES.find((m) => m.id === moduleId) ?? MODULES[0];
  const lessonIndex = mod.lessons.findIndex((l) => l.id === lessonId);
  const lesson = mod.lessons[lessonIndex] ?? mod.lessons[0];
  const totalLessons = mod.lessons.length;

  const handleAudio = () => {
    Speech.stop();
    Speech.speak(lesson.audioText, { language: "en", pitch: 1.0, rate: 0.85 });
  };

  const handleNext = () => {
    completeLesson(lesson.id);
    Speech.stop();
    const nextIndex = lessonIndex + 1;
    if (nextIndex < totalLessons) {
      router.replace(`/lesson/${mod.id}/content/${mod.lessons[nextIndex].id}` as any);
    } else {
      router.replace(`/lesson/${mod.id}/quiz/quiz-1` as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-card" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-2 pb-3 border-b border-border">
        <TouchableOpacity
          onPress={() => {
            Speech.stop();
            router.back();
          }}
          className="w-9 h-9 rounded-full items-center justify-center mr-3 bg-muted"
        >
          <ChevronLeft size={20} color={theme.color.foreground} />
        </TouchableOpacity>
        <Text className="text-[15px] font-semibold text-foreground flex-1">
          {mod.title}
        </Text>
        <Text className="text-[12px] text-muted-foreground">
          {lessonIndex + 1} of {totalLessons}
        </Text>
      </View>

      {/* Progress */}
      <View className="h-1" style={{ backgroundColor: theme.color.mutedSurface }}>
        <View
          className="h-1"
          style={{
            width: `${((lessonIndex + 1) / totalLessons) * 100}%`,
            backgroundColor: theme.color.primaryLight,
          }}
        />
      </View>

      {/* Content */}
      <View className="flex-1 px-6 justify-center">
        <View
          className="w-full h-44 rounded-3xl items-center justify-center mb-8"
          style={{ backgroundColor: theme.color.mint }}
        >
          <Text className="text-[80px]">{lesson.imageEmoji}</Text>
        </View>

        <Text className="text-[12px] font-bold mb-2 tracking-wide" style={{ color: theme.color.primaryLight }}>
          PART {lessonIndex + 1}
        </Text>
        <Text className="text-[24px] font-bold text-foreground mb-3">
          {lesson.title}
        </Text>
        <Text className="text-[16px] text-foreground leading-7 mb-5" style={{ opacity: 0.85 }}>
          {lesson.body}
        </Text>

        {lesson.keyPoint && (
          <View
            className="flex-row items-start rounded-2xl px-4 py-3"
            style={{ backgroundColor: theme.color.cream }}
          >
            <Lightbulb size={18} color={theme.color.warningDark} />
            <Text className="text-[14px] ml-2 flex-1 leading-5" style={{ color: "#92400E" }}>
              <Text className="font-bold">Remember: </Text>
              {lesson.keyPoint}
            </Text>
          </View>
        )}

        <TouchableOpacity onPress={handleAudio} className="mt-5 flex-row items-center self-start">
          <View
            className="w-9 h-9 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: theme.color.mint }}
          >
            <Volume2 size={17} color={theme.color.primary} />
          </View>
          <Text className="text-[14px] font-semibold" style={{ color: theme.color.primary }}>
            Listen to this lesson
          </Text>
        </TouchableOpacity>
      </View>

      {/* CTA */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleNext}
          className="rounded-2xl py-4 items-center flex-row justify-center"
          style={{ backgroundColor: theme.color.primary }}
        >
          <Text className="text-white text-[16px] font-bold mr-2">
            {lessonIndex + 1 < totalLessons ? "I Understand" : "Go to Quiz"}
          </Text>
          <ArrowRight size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
