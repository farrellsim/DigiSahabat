// TODO: Replace fake download animation with real offline module caching.
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, CheckCircle2, CloudDownload } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MODULES } from "../../src/data/modules";

type Stage = "ready" | "downloading" | "done";

const STEPS = [
  "Preparing module...",
  "Downloading lesson images...",
  "Saving quiz...",
  "Ready for offline learning!",
];

export default function Download() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const mod = MODULES.find((m) => m.id === moduleId) ?? MODULES[0];

  const [stage, setStage] = useState<Stage>("ready");
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState(STEPS[0]);

  const startDownload = () => {
    setStage("downloading");
    setProgress(0);

    let pct = 0;
    let stepIdx = 0;

    const interval = setInterval(() => {
      pct += 2;
      setProgress(pct);

      const newStep = Math.floor((pct / 100) * (STEPS.length - 1));
      if (newStep !== stepIdx && newStep < STEPS.length) {
        stepIdx = newStep;
        setStepText(STEPS[newStep]);
      }

      if (pct >= 100) {
        clearInterval(interval);
        setStepText(STEPS[STEPS.length - 1]);
        setStage("done");
      }
    }, 60);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center px-5 pt-4 pb-3 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: "#F3F4F6" }}
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        <Text className="text-[16px] font-bold text-gray-900">
          Download Module
        </Text>
      </View>

      <View className="flex-1 px-6 items-center justify-center">
        {/* Icon */}
        <View
          className="w-28 h-28 rounded-3xl items-center justify-center mb-6"
          style={{ backgroundColor: "#EAF7F1" }}
        >
          {stage === "done" ? (
            <CheckCircle2 size={56} color="#2F7D62" />
          ) : (
            <Text className="text-[56px]">{mod.imageEmoji}</Text>
          )}
        </View>

        <Text className="text-[22px] font-bold text-gray-900 text-center mb-2">
          {mod.title}
        </Text>

        <Text className="text-[13px] text-gray-500 text-center mb-8">
          {mod.estimatedMinutes * 2} MB · {mod.lessons.length} lessons + quiz
        </Text>

        {stage === "ready" && (
          <>
            <View
              className="rounded-2xl px-5 py-4 mb-8 w-full"
              style={{ backgroundColor: "#EAF7F1" }}
            >
              <Text className="text-[13px] text-gray-700 leading-5">
                Download this module to study offline. It will be saved on your
                phone so you can learn without internet.
              </Text>
            </View>
            <TouchableOpacity
              onPress={startDownload}
              className="w-full rounded-2xl py-4 items-center flex-row justify-center"
              style={{ backgroundColor: "#2F7D62" }}
            >
              <CloudDownload size={20} color="white" />
              <Text className="text-white text-[16px] font-bold ml-2">
                Download Module
              </Text>
            </TouchableOpacity>
          </>
        )}

        {stage === "downloading" && (
          <View className="w-full">
            {/* Progress circle indicator */}
            <View className="items-center mb-6">
              <Text
                className="text-[42px] font-bold"
                style={{ color: "#2F7D62" }}
              >
                {progress}%
              </Text>
            </View>

            {/* Progress bar */}
            <View className="h-3 rounded-full bg-gray-100 overflow-hidden mb-4">
              <View
                className="h-3 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#6AB99D",
                }}
              />
            </View>

            <Text className="text-[14px] text-gray-600 text-center font-medium">
              {stepText}
            </Text>
          </View>
        )}

        {stage === "done" && (
          <View className="w-full items-center">
            <View
              className="rounded-2xl px-5 py-4 mb-6 w-full"
              style={{ backgroundColor: "#D1FAE5" }}
            >
              <View className="flex-row items-center">
                <CheckCircle2 size={20} color="#065F46" />
                <Text
                  className="text-[14px] font-semibold ml-2"
                  style={{ color: "#065F46" }}
                >
                  Module saved for offline learning.
                </Text>
              </View>
              <Text className="text-[12px] text-green-700 mt-1 ml-7">
                You can now learn without internet!
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              className="w-full rounded-2xl py-4 items-center"
              style={{ backgroundColor: "#2F7D62" }}
            >
              <Text className="text-white text-[16px] font-bold">Done</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
