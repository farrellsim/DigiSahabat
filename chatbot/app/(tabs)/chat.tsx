import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://192.168.1.5:4000/chat";

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
    <Text className="text-[15px] text-gray-800">DigiBuddy is typing{dots}</Text>
  );
}

export default function Index() {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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
    [messages]
  );

  const scrollToBottom = () => {
    requestAnimationFrame(() =>
      listRef.current?.scrollToEnd({ animated: true })
    );
  };

  // Add/remove typing item INSIDE the list (no floating absolute bubble)
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
            "Sorry — I couldn’t reach the server. Check API_URL and backend.",
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

            {/* Bottom area (input + fake tab bar) */}
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
                </View>
              </View>

              {/* Faux tab bar */}
              <View className="border-t border-gray-100 px-6 pt-3 pb-6">
                <View className="flex-row justify-between">
                  <View className="items-center">
                    <Ionicons name="home-outline" size={22} color="#6B7280" />
                    <Text className="text-[12px] text-gray-500 mt-1">Home</Text>
                  </View>

                  <View className="items-center">
                    <Ionicons name="chatbubble" size={22} color="#4CAF7A" />
                    <Text className="text-[12px] text-[#4CAF7A] mt-1">
                      AI Chat
                    </Text>
                  </View>

                  <View className="items-center">
                    <Ionicons name="book-outline" size={22} color="#6B7280" />
                    <Text className="text-[12px] text-gray-500 mt-1">
                      Learn
                    </Text>
                  </View>

                  <View className="items-center">
                    <Ionicons name="person-outline" size={22} color="#6B7280" />
                    <Text className="text-[12px] text-gray-500 mt-1">
                      Profile
                    </Text>
                  </View>

                  <View className="items-center">
                    <Ionicons
                      name="settings-outline"
                      size={22}
                      color="#6B7280"
                    />
                    <Text className="text-[12px] text-gray-500 mt-1">
                      Settings
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
