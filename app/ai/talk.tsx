import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Mic, MicOff, StopCircle } from "lucide-react-native";
import { router } from "expo-router";

const API_URL = "http://localhost:4000/chat";
const TRANSCRIBE_URL = "http://localhost:4000/transcribe";

const DEMO_QUESTION = "How do I know if a message is a scam?";

type Status = "idle" | "listening" | "thinking" | "speaking";

export default function AITalk() {
  const [status, setStatus] = useState<Status>("idle");
  const [reply, setReply] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isDemoMode] = useState(
    process.env.EXPO_PUBLIC_DEMO_MODE === "true" || true
  );

  useEffect(() => {
    return () => {
      Speech.stop();
      if (recording) recording.stopAndUnloadAsync();
    };
  }, []);

  const sendToAI = async (text: string) => {
    setStatus("thinking");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      });
      const data = await res.json();
      const replyText =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply
          : "Sorry, I could not reply. Please try again.";

      setReply(replyText);
      setStatus("speaking");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      Speech.speak(replyText, {
        language: "en",
        pitch: 1.1,
        rate: 0.9,
        onDone: () => setStatus("idle"),
      });
    } catch {
      setReply("I could not reach the server. Please check your connection.");
      setStatus("idle");
    }
  };

  const startListening = async () => {
    if (isDemoMode) {
      // Demo mode: use pre-filled question
      setStatus("listening");
      setReply("");
      setTimeout(async () => {
        await sendToAI(DEMO_QUESTION);
      }, 1800);
      return;
    }

    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert("Microphone permission is required!");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setStatus("listening");
      setReply("");
    } catch (e) {
      console.error("Mic error:", e);
    }
  };

  const stopListening = async () => {
    if (!recording) return;
    setStatus("thinking");
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (!uri) throw new Error("No audio URI");

      const formData = new FormData();
      formData.append("audio", { uri, type: "audio/m4a", name: "recording.m4a" } as any);

      const transcribeRes = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        body: formData,
      });
      const { transcript } = await transcribeRes.json();
      if (!transcript) throw new Error("Empty transcript");

      await sendToAI(transcript);
    } catch {
      setReply("I could not hear that. Please try again.");
      setStatus("idle");
    }
  };

  const statusConfig = {
    idle: {
      text: "Tap to ask DigiBuddy",
      sub: isDemoMode ? `Demo: "${DEMO_QUESTION}"` : "Hold mic and speak",
      color: "rgba(255,255,255,0.7)",
    },
    listening: {
      text: "Listening...",
      sub: "Speak now, I am listening!",
      color: "rgba(255,255,255,0.85)",
    },
    thinking: {
      text: "Thinking...",
      sub: "Give me a moment...",
      color: "rgba(255,255,255,0.7)",
    },
    speaking: {
      text: "Speaking...",
      sub: reply,
      color: "rgba(255,255,255,0.9)",
    },
  }[status];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: "#2F7D62" }}
      edges={["top", "bottom"]}
    >
      {/* Back button */}
      <TouchableOpacity
        onPress={() => {
          Speech.stop();
          router.back();
        }}
        className="flex-row items-center mx-5 mt-2"
        style={{
          alignSelf: "flex-start",
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <ChevronLeft size={18} color="white" />
        <Text className="text-white text-[14px] ml-1">Back to chat</Text>
      </TouchableOpacity>

      {/* Demo mode badge */}
      {isDemoMode && (
        <View
          className="mx-5 mt-3 self-start px-3 py-1 rounded-full"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <Text className="text-white text-[11px] font-semibold">
            🎯 Demo Voice Mode
          </Text>
        </View>
      )}

      {/* Center area */}
      <View className="flex-1 items-center justify-center px-8">
        {/* Ripple rings when listening */}
        <View className="items-center justify-center" style={{ width: 220, height: 220 }}>
          {status === "listening" && (
            <>
              <View
                style={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  width: 170,
                  height: 170,
                  borderRadius: 85,
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  width: 130,
                  height: 130,
                  borderRadius: 65,
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.4)",
                }}
              />
            </>
          )}

          {/* Mascot circle */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.95)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 48 }}>🤖</Text>
          </View>
        </View>

        {/* Status text */}
        <Text
          className="text-[26px] font-bold text-white text-center mt-6 mb-2"
        >
          {statusConfig.text}
        </Text>

        {status === "thinking" && (
          <ActivityIndicator color="white" size="large" style={{ marginTop: 8 }} />
        )}

        {statusConfig.sub ? (
          <Text
            className="text-[15px] text-center px-4 mt-2 leading-6"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.sub}
          </Text>
        ) : null}
      </View>

      {/* Bottom control */}
      <View className="items-center pb-10">
        {status === "idle" && (
          <TouchableOpacity
            onPress={startListening}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 32,
              paddingHorizontal: 32,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Mic size={22} color="white" />
            <Text className="text-white text-[16px] font-bold">
              {isDemoMode ? "Start Demo" : "Start Talking"}
            </Text>
          </TouchableOpacity>
        )}

        {status === "listening" && !isDemoMode && (
          <TouchableOpacity
            onPress={stopListening}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 32,
              paddingHorizontal: 32,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <MicOff size={22} color="white" />
            <Text className="text-white text-[16px] font-bold">
              Stop Listening
            </Text>
          </TouchableOpacity>
        )}

        {status === "speaking" && (
          <TouchableOpacity
            onPress={() => {
              Speech.stop();
              setStatus("idle");
            }}
            style={{
              backgroundColor: "rgba(255,255,255,0.2)",
              borderRadius: 32,
              paddingHorizontal: 32,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <StopCircle size={22} color="white" />
            <Text className="text-white text-[16px] font-bold">Stop</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
