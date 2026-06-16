import React from "react";
import { Pressable, Text, View } from "react-native";

interface VoiceButtonProps {
  isRecording: boolean;
  isDisabled: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
}

export function VoiceButton({
  isRecording,
  isDisabled,
  onPressIn,
  onPressOut,
}: VoiceButtonProps) {
  return (
    <View className="items-center">
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        className={`w-16 h-16 rounded-full items-center justify-center ${
          isRecording
            ? "bg-red-500 scale-110"
            : isDisabled
              ? "bg-gray-300"
              : "bg-blue-500"
        }`}
        style={{ transform: [{ scale: isRecording ? 1.1 : 1 }] }}
      >
        <Text className="text-2xl">{isRecording ? "🔴" : "🎤"}</Text>
      </Pressable>
      <Text className="text-gray-500 text-sm mt-2">
        {isRecording ? "Release to send" : "Hold to speak"}
      </Text>
    </View>
  );
}
