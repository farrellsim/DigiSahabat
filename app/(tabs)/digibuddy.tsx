import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Mic, Send, Volume2, Sparkles } from "lucide-react-native";
import { theme, shadow } from "../../src/constants/theme";
import { API_URL as API_BASE } from "../../src/config";
import { DigiBuddyAvatar } from "../../src/components/ui/DigiBuddyAvatar";

const API_URL = `${API_BASE}/ai/chat`;

/** Strip markdown so replies read as plain, friendly text (no **, *, #, `). */
function cleanReply(s: string): string {
  return s
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/(^|\s)\*(?=\S)(.*?)\*/g, "$1$2") // italics
    .replace(/`([^`]*)`/g, "$1") // inline code
    .replace(/_{1,2}(.*?)_{1,2}/g, "$1") // underscores
    .replace(/^#{1,6}\s+/gm, "") // headings
    .replace(/^\s*[-*•]\s+/gm, "• ") // bullets -> clean bullet
    .replace(/\n{3,}/g, "\n\n") // collapse extra blank lines
    .trim();
}

const SUGGESTED_CHIPS = [
  "What is a scam message?",
  "How do I use a printer?",
  "What is Wi-Fi?",
  "How do I create a safe PIN?",
];

type Role = "user" | "assistant";
type Msg = { id: string; role: Role; content: string };

function TypingDots() {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 450);
    return () => clearInterval(t);
  }, []);
  return (
    <Text className="text-[15px] text-muted-foreground">
      DigiBuddy is thinking{dots}
    </Text>
  );
}

function Bubble({ item, onSpeak }: { item: Msg; onSpeak: (t: string) => void }) {
  const isAssistant = item.role === "assistant";
  return (
    <View className={`flex-row px-4 mb-3 ${isAssistant ? "" : "justify-end"}`}>
      {isAssistant && (
        <DigiBuddyAvatar size={34} style={{ marginRight: 8, marginTop: 2 }} />
      )}
      <View
        className="max-w-[76%] rounded-2xl px-4 py-3"
        style={{
          backgroundColor: isAssistant ? theme.color.card : theme.color.primary,
          borderWidth: isAssistant ? 1 : 0,
          borderColor: theme.color.border,
          borderTopLeftRadius: isAssistant ? 6 : 16,
          borderTopRightRadius: isAssistant ? 16 : 6,
          ...shadow.sm,
        }}
      >
        {item.content === "__TYPING__" ? (
          <TypingDots />
        ) : (
          <Text
            className="text-[16px] leading-[24px]"
            style={{ color: isAssistant ? theme.color.foreground : "#fff" }}
          >
            {item.content}
          </Text>
        )}
      </View>
      {isAssistant && item.content !== "__TYPING__" && (
        <TouchableOpacity
          onPress={() => onSpeak(item.content)}
          className="w-8 h-8 rounded-full items-center justify-center ml-2 mt-1"
          style={{ backgroundColor: theme.color.mint }}
        >
          <Volume2 size={15} color={theme.color.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function DigiBuddy() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "a1",
      role: "assistant",
      content:
        "Hello! I am DigiBuddy, your digital skills helper. How can I help you today?",
    },
  ]);

  const listRef = useRef<FlatList<Msg>>(null);

  const payloadMessages = useMemo(
    () => messages.map((m) => ({ role: m.role, content: m.content })),
    [messages]
  );

  const displayMessages = useMemo(() => {
    if (!isTyping) return messages;
    return [
      ...messages,
      { id: "typing", role: "assistant" as Role, content: "__TYPING__" },
    ];
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: "en", pitch: 1.0, rate: 0.9 });
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isTyping) return;

    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", content: msg },
    ]);
    setInput("");
    setIsTyping(true);
    scrollToBottom();

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...payloadMessages, { role: "user", content: msg }],
        }),
      });
      const data = await res.json();
      const reply =
        typeof data?.reply === "string" && data.reply.trim()
          ? cleanReply(data.reply)
          : "Sorry, I could not reply. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: String(Date.now() + 1), role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          role: "assistant",
          content:
            "I cannot reach the server right now. Please check your connection.",
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View className="flex-1">
            {/* Header */}
            <View className="px-5 py-3 border-b border-border bg-card flex-row items-center">
              <DigiBuddyAvatar size={48} style={{ marginRight: 12 }} />
              <View className="flex-1">
                <Text className="text-[20px] font-extrabold text-foreground">
                  DigiBuddy
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: theme.color.success }}
                  />
                  <Text className="text-[13px] text-muted-foreground">
                    AI Learning Assistant
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/ai/talk" as any)}
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.color.mint }}
                accessibilityRole="button"
                accessibilityLabel="Voice mode"
              >
                <Mic size={22} color={theme.color.primary} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              ref={listRef}
              data={displayMessages}
              keyExtractor={(m) => m.id}
              renderItem={({ item }) => <Bubble item={item} onSpeak={speak} />}
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 12 }}
              onContentSizeChange={scrollToBottom}
              showsVerticalScrollIndicator={false}
            />

            {/* Suggested chips */}
            {messages.length === 1 && !isTyping && (
              <View className="px-4 pb-3">
                <View className="flex-row items-center mb-2 ml-1">
                  <Sparkles size={15} color={theme.color.muted} />
                  <Text className="text-[12px] font-bold text-muted-foreground ml-1.5 tracking-wide">
                    TRY ASKING
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {SUGGESTED_CHIPS.map((chip) => (
                    <TouchableOpacity
                      key={chip}
                      onPress={() => send(chip)}
                      accessibilityRole="button"
                      className="rounded-full border border-border px-4 py-2.5 bg-card"
                    >
                      <Text className="text-[14px] text-foreground">{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Input bar */}
            <View className="px-4 pt-3 pb-3 border-t border-border bg-card">
              <View className="flex-row items-end gap-3">
                <View
                  className="flex-1 rounded-2xl border border-border px-4 py-3"
                  style={{ backgroundColor: theme.color.background, minHeight: 48 }}
                >
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Type your question here..."
                    placeholderTextColor={theme.color.muted}
                    className="text-[16px] text-foreground"
                    multiline
                    onFocus={scrollToBottom}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => send()}
                  disabled={isTyping || !input.trim()}
                  accessibilityRole="button"
                  accessibilityLabel="Send message"
                  className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor:
                      isTyping || !input.trim()
                        ? theme.color.primaryLight
                        : theme.color.primary,
                  }}
                >
                  <Send size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
