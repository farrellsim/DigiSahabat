import * as Speech from "expo-speech";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { Message } from "../types/chat";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  const handleSpeak = () => {
    Speech.speak(message.content, {
      language: "en",
      rate: 0.9,
    });
  };

  return (
    <View className={`max-w-[80%] mb-3 ${isUser ? "self-end" : "self-start"}`}>
      <Pressable
        onLongPress={handleSpeak}
        className={`px-4 py-3 rounded-2xl ${
          isUser ? "bg-blue-500 rounded-br-sm" : "bg-gray-200 rounded-bl-sm"
        }`}
      >
        <Text
          className={`text-base ${isUser ? "text-white" : "text-gray-800"}`}
        >
          {message.content}
        </Text>
      </Pressable>
      <Text
        className={`text-xs text-gray-400 mt-1 ${isUser ? "text-right" : "text-left"}`}
      >
        {isUser ? "You" : "AI Tutor"} • Long press to hear
      </Text>
    </View>
  );
}
