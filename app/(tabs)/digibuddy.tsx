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
import { Bot, Mic, Send, Volume2, Sparkles } from "lucide-react-native";
import { theme, shadow } from "../../src/constants/theme";

const API_URL = "http://localhost:4000/chat";

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
        <View
          className="w-8 h-8 rounded-full items-center justify-center mr-2 mt-1"
          style={{ backgroundColor: theme.color.mint }}
        >
          <Bot size={16} color={theme.color.primary} />
        </View>
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
            className="text-[15px] leading-[22px]"
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
          ? data.reply
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
              <View
                className="w-11 h-11 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: theme.color.mint }}
              >
                <Bot size={22} color={theme.color.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-[18px] font-bold text-foreground">
                  DigiBuddy
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <View
                    className="w-1.5 h-1.5 rounded-full mr-1.5"
                    style={{ backgroundColor: theme.color.success }}
                  />
                  <Text className="text-[12px] text-muted-foreground">
                    AI Learning Assistant
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/ai/talk" as any)}
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{ backgroundColor: theme.color.mint }}
              >
                <Mic size={19} color={theme.color.primary} />
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
                  <Sparkles size={13} color={theme.color.muted} />
                  <Text className="text-[11px] font-bold text-muted-foreground ml-1.5 tracking-wide">
                    TRY ASKING
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {SUGGESTED_CHIPS.map((chip) => (
                    <TouchableOpacity
                      key={chip}
                      onPress={() => send(chip)}
                      className="rounded-full border border-border px-3.5 py-2 bg-card"
                    >
                      <Text className="text-[12px] text-foreground">{chip}</Text>
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
                    className="text-[15px] text-foreground"
                    multiline
                    onFocus={scrollToBottom}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => send()}
                  disabled={isTyping || !input.trim()}
                  className="w-12 h-12 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor:
                      isTyping || !input.trim()
                        ? theme.color.primaryLight
                        : theme.color.primary,
                  }}
                >
                  <Send size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
