import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

interface ChatInputProps {
  onSend: (message: string) => void;
  isDisabled: boolean;
}

export function ChatInput({ onSend, isDisabled }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim() && !isDisabled) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <View className="flex-row items-center gap-2">
      <TextInput
        className="flex-1 bg-gray-100 rounded-full px-4 py-3 text-base"
        placeholder="Type a message..."
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
        editable={!isDisabled}
        multiline
      />
      <Pressable
        onPress={handleSend}
        disabled={!text.trim() || isDisabled}
        className={`w-12 h-12 rounded-full items-center justify-center ${
          text.trim() && !isDisabled ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <Text className="text-xl">📤</Text>
      </Pressable>
    </View>
  );
}
