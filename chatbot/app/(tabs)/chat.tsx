import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const API_URL = "http://192.168.1.12:4000/chat";
const TRANSCRIBE_URL = "http://192.168.1.12:4000/transcribe";

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string };
type Status = "idle" | "listening" | "thinking" | "speaking";

// ─── Typing dots ───────────────────────────────────────────────────────────────
function TypingDots() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 450);
    return () => clearInterval(t);
  }, []);
  return (
    <Text className="text-[15px] text-gray-800">DigiBuddy is typing{dots}</Text>
  );
}

// ─── AI Talk Screen ────────────────────────────────────────────────────────────
function AITalkScreen({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [reply, setReply] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    return () => {
      Speech.stop();
      if (recording) recording.stopAndUnloadAsync();
    };
  }, []);

  const startListening = async () => {
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
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
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

      // Send audio to backend for Gemini transcription
      const formData = new FormData();
      formData.append("audio", {
        uri,
        type: "audio/m4a",
        name: "recording.m4a",
      } as any);

      const transcribeRes = await fetch(TRANSCRIBE_URL, {
        method: "POST",
        body: formData,
      });

      const { transcript } = await transcribeRes.json();
      if (!transcript) throw new Error("Empty transcript");

      await sendToGemini(transcript);
    } catch (e) {
      console.error("Stop error:", e);
      setReply("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  const sendToGemini = async (text: string) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      const replyText =
        typeof data?.reply === "string" && data.reply.trim().length > 0
          ? data.reply
          : "Sorry, I could not reply.";

      setReply(replyText);
      setStatus("speaking");

      Speech.speak(replyText, {
        language: "en",
        pitch: 1.0,
        rate: 0.95,
        volume: 4.0,
        onDone: () => setStatus("idle"),
      });
    } catch {
      setReply("Could not reach the server.");
      setStatus("idle");
    }
  };

  const statusText = {
    idle: "Tap the mic to start",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
  }[status];

  const statusSub = {
    idle: "",
    listening: "Speak now, I'm all ears!",
    thinking: "Give me a moment...",
    speaking: reply,
  }[status];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#5a9e8f" }}>
      {/* Back button */}
      <TouchableOpacity
        onPress={onClose}
        style={{
          margin: 20,
          alignSelf: "flex-start",
          backgroundColor: "rgba(255,255,255,0.25)",
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Ionicons name="chevron-back" size={18} color="white" />
        <Text style={{ color: "white", fontSize: 15 }}>Back</Text>
      </TouchableOpacity>

      {/* Mascot + ripple circles */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {status === "listening" && (
            <>
              <View
                style={{
                  position: "absolute",
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              />
              <View
                style={{
                  position: "absolute",
                  width: 170,
                  height: 170,
                  borderRadius: 85,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.4)",
                }}
              />
            </>
          )}
          {/* Mascot */}
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: "white",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text style={{ fontSize: 52 }}>🤖</Text>
          </View>
        </View>

        {/* Status text */}
        <Text
          style={{
            fontSize: 26,
            fontWeight: "600",
            color: "white",
            marginBottom: 8,
          }}
        >
          {statusText}
        </Text>

        {statusSub ? (
          <Text
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.85)",
              textAlign: "center",
              paddingHorizontal: 40,
              lineHeight: 22,
            }}
          >
            {statusSub}
          </Text>
        ) : null}

        {status === "thinking" && (
          <ActivityIndicator
            color="white"
            size="large"
            style={{ marginTop: 20 }}
          />
        )}
      </View>

      {/* Bottom button */}
      <View style={{ alignItems: "center", paddingBottom: 50 }}>
        {status === "listening" ? (
          <TouchableOpacity
            onPress={stopListening}
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: 30,
              paddingHorizontal: 28,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="mic-off" size={20} color="white" />
            <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
              Stop Listening
            </Text>
          </TouchableOpacity>
        ) : status === "idle" ? (
          <TouchableOpacity
            onPress={startListening}
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              borderRadius: 30,
              paddingHorizontal: 28,
              paddingVertical: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="mic" size={20} color="white" />
            <Text style={{ color: "white", fontSize: 16, fontWeight: "500" }}>
              Start Talking
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

// ─── Main Chat Screen ──────────────────────────────────────────────────────────
export default function Index() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTalk, setShowTalk] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "a1",
      role: "assistant",
      content: "Hello! How can I help you today?",
    },
    { id: "a2", role: "assistant", content: "I will explain step by step." },
  ]);

  const listRef = useRef<FlatList<Msg>>(null);

  const payloadMessages = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages],
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true }),
    );
  };

  const displayMessages = useMemo(() => {
    if (!isTyping) return messages;
    return [
      ...messages,
      { id: "typing", role: "assistant", content: "__TYPING__" } as Msg,
    ];
  }, [messages, isTyping]);

  const send = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Msg = {
      id: String(Date.now()),
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...payloadMessages, { role: "user", content: text }],
        }),
      });

      const data = await res.json();
      const replyText =
        typeof data?.reply === "string" && data.reply.trim().length > 0
          ? data.reply
          : "Sorry, I could not reply.";

      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "assistant", content: replyText },
      ]);
      scrollToBottom();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          role: "assistant",
          content:
            "Sorry — I couldn't reach the server. Check API_URL and backend.",
        },
      ]);
      scrollToBottom();
    } finally {
      setIsTyping(false);
    }
  };

  const Bubble = ({ item }: { item: Msg }) => {
    const isAssistant = item.role === "assistant";
    return (
      <View className="flex-row px-6 mb-4">
        {isAssistant ? (
          <View className="w-10 items-center pt-1">
            <View className="w-7 h-7 rounded-full bg-white border border-gray-200 items-center justify-center">
              <Text className="text-[11px]">🤖</Text>
            </View>
          </View>
        ) : (
          <View className="w-10" />
        )}
        <View
          className={[
            "max-w-[78%] rounded-2xl bg-white border border-gray-200 px-4 py-3",
            isAssistant ? "" : "ml-auto",
          ].join(" ")}
          style={{
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 6 },
            elevation: 2,
          }}
        >
          {item.content === "__TYPING__" ? (
            <TypingDots />
          ) : (
            <Text className="text-[16px] text-gray-800 leading-[22px]">
              {item.content}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Show AI Talk screen when call button pressed
  if (showTalk) return <AITalkScreen onClose={() => setShowTalk(false)} />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-8 border-b border-gray-100">
              <View className="px-6 pb-4 flex-row items-center">
                <TouchableOpacity className="mr-3">
                  <Ionicons name="chevron-back" size={24} color="#111827" />
                </TouchableOpacity>
                <View className="w-9 h-9 rounded-full bg-white border border-gray-200 items-center justify-center mr-3">
                  <Text>🤖</Text>
                </View>
                <View>
                  <Text className="text-[20px] font-semibold text-gray-900">
                    DigiBuddy
                  </Text>
                  <Text className="text-[13px] text-gray-500 mt-0.5">
                    Your AI Learning Assistant
                  </Text>
                </View>
              </View>
            </View>

            {/* Messages */}
            <FlatList
              ref={listRef}
              data={displayMessages}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => <Bubble item={item} />}
              contentContainerStyle={{ paddingTop: 26, paddingBottom: 14 }}
              onContentSizeChange={scrollToBottom}
            />

            {/* Bottom area */}
            <View className="bg-white border-t border-gray-100">
              <View className="px-5 pt-3 pb-4">
                <View className="flex-row items-center">
                  <View className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                    <TextInput
                      value={input}
                      onChangeText={setInput}
                      placeholder="Type your question here..."
                      placeholderTextColor="#9CA3AF"
                      className="text-[15px] text-gray-900"
                      multiline
                      textAlignVertical="top"
                      onFocus={scrollToBottom}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={send}
                    disabled={isTyping}
                    className={[
                      "ml-3 w-14 h-14 rounded-2xl items-center justify-center",
                      isTyping ? "bg-green-300" : "bg-green-600",
                    ].join(" ")}
                  >
                    <Ionicons name="paper-plane" size={20} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity className="ml-3 w-14 h-14 rounded-2xl bg-white border border-gray-200 items-center justify-center">
                    <Ionicons name="mic" size={20} color="#111827" />
                  </TouchableOpacity>

                  {/* Call button → opens AI Talk screen */}
                  <TouchableOpacity
                    onPress={() => setShowTalk(true)}
                    className="ml-3 w-14 h-14 rounded-2xl bg-green-600 items-center justify-center"
                  >
                    <Ionicons name="call" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
