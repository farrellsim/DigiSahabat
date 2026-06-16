// TODO: Replace fake transfer with Bluetooth/Wi-Fi Direct/Nearby Share implementation.
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, CheckCircle2, Share2 } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { MODULES } from "../../src/data/modules";

type Stage = "ready" | "searching" | "connecting" | "sending" | "done";

const STAGE_STEPS: Record<Stage, string> = {
  ready: "",
  searching: "Looking for nearby device...",
  connecting: "Connecting...",
  sending: "Sending module...",
  done: "Transfer complete!",
};

export default function Transfer() {
  const { moduleId } = useLocalSearchParams<{ moduleId: string }>();
  const mod = MODULES.find((m) => m.id === moduleId) ?? MODULES[0];

  const [stage, setStage] = useState<Stage>("ready");
  const [progress, setProgress] = useState(0);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    if (stage === "ready" || stage === "done") return;

    const dotTimer = setInterval(() => {
      setDotCount((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(dotTimer);
  }, [stage]);

  const startTransfer = () => {
    setStage("searching");
    setProgress(0);

    setTimeout(() => setStage("connecting"), 2000);
    setTimeout(() => {
      setStage("sending");
      let pct = 0;
      const prog = setInterval(() => {
        pct += 3;
        setProgress(pct);
        if (pct >= 100) {
          clearInterval(prog);
          setStage("done");
        }
      }, 80);
    }, 4000);
  };

  const dots = ".".repeat(dotCount);

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
          Share Module Nearby
        </Text>
      </View>

      <View className="flex-1 px-6 items-center justify-center">
        {/* Two phone illustration */}
        <View className="flex-row items-center justify-center mb-8" style={{ gap: 24 }}>
          {/* Sender phone */}
          <View className="items-center">
            <View
              className="w-20 h-32 rounded-2xl items-center justify-center border-4"
              style={{
                backgroundColor: "#EAF7F1",
                borderColor: stage !== "ready" ? "#6AB99D" : "#E5E7EB",
              }}
            >
              <Text className="text-[32px]">📱</Text>
              <Text className="text-[10px] text-gray-500 mt-1 font-semibold">
                YOUR PHONE
              </Text>
            </View>
          </View>

          {/* Animated dots / arrow */}
          <View className="items-center" style={{ width: 60 }}>
            {stage === "sending" ? (
              <View>
                <Text
                  className="text-[22px] font-bold text-center"
                  style={{ color: "#6AB99D", letterSpacing: 4 }}
                >
                  →
                </Text>
                <Text
                  className="text-[18px] font-bold text-center mt-1"
                  style={{ color: "#6AB99D" }}
                >
                  {progress}%
                </Text>
              </View>
            ) : stage === "done" ? (
              <CheckCircle2 size={36} color="#2F7D62" />
            ) : (
              <Text
                className="text-[22px] text-center"
                style={{ color: "#D1D5DB", letterSpacing: 2 }}
              >
                ···
              </Text>
            )}
          </View>

          {/* Receiver phone */}
          <View className="items-center">
            <View
              className="w-20 h-32 rounded-2xl items-center justify-center border-4"
              style={{
                backgroundColor:
                  stage === "done" ? "#EAF7F1" : "#F9FAFB",
                borderColor: stage === "done" ? "#6AB99D" : "#E5E7EB",
              }}
            >
              <Text className="text-[32px]">
                {stage === "done" ? "📱" : "📱"}
              </Text>
              <Text className="text-[10px] text-gray-400 mt-1 font-semibold">
                NEARBY PHONE
              </Text>
            </View>
          </View>
        </View>

        {/* Status */}
        {stage !== "ready" && stage !== "done" && (
          <Text
            className="text-[16px] font-semibold text-center mb-6"
            style={{ color: "#2F7D62" }}
          >
            {STAGE_STEPS[stage]}
            {dots}
          </Text>
        )}

        {stage === "sending" && (
          <View className="w-full h-3 rounded-full bg-gray-100 overflow-hidden mb-6">
            <View
              className="h-3 rounded-full"
              style={{ width: `${progress}%`, backgroundColor: "#6AB99D" }}
            />
          </View>
        )}

        {stage === "ready" && (
          <>
            <Text className="text-[20px] font-bold text-gray-900 text-center mb-2">
              {mod.title}
            </Text>
            <Text className="text-[13px] text-gray-500 text-center mb-6">
              Share this module with a nearby phone using local transfer.
            </Text>
            <View
              className="rounded-2xl px-5 py-4 mb-8 w-full"
              style={{ backgroundColor: "#EAF7F1" }}
            >
              <Text className="text-[13px] text-gray-700 leading-5">
                Make sure both phones are close together and Wi-Fi is on. Tap
                the button below to start transferring.
              </Text>
            </View>
            <TouchableOpacity
              onPress={startTransfer}
              className="w-full rounded-2xl py-4 items-center flex-row justify-center"
              style={{ backgroundColor: "#2F7D62" }}
            >
              <Share2 size={20} color="white" />
              <Text className="text-white text-[16px] font-bold ml-2">
                Start Transfer
              </Text>
            </TouchableOpacity>
          </>
        )}

        {stage === "done" && (
          <View className="w-full items-center">
            <Text className="text-[22px] font-bold text-gray-900 text-center mb-3">
              Transfer Complete!
            </Text>
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
                  Module transferred successfully.
                </Text>
              </View>
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
