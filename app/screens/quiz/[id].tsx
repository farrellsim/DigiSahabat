import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Import your database services
import { updateModuleProgress } from "../../../src/services/db";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What button do you press to write a new email in Gmail?",
    options: [
      "Inbox",
      "Compose",
      "Send",
      "Draft",
    ],
    correctAnswer: 1,
    explanation: "The 'Compose' button is used to start writing a new email.",
  },
  {
    id: 2,
    question: "What does the star icon next to an email do?",
    options: [
      "Deletes the email",
      "Archives the email",
      "Marks the email as important",
      "Forwards the email",
    ],
    correctAnswer: 2,
    explanation: "Starring an email marks it as important so you can find it easily later.",
  },
  {
    id: 3,
    question: "Which field do you fill in to add the recipient's email address?",
    options: [
      "Subject",
      "To",
      "From",
      "CC",
    ],
    correctAnswer: 1,
    explanation: "The 'To' field is where you enter the recipient's email address.",
  },
  {
    id: 4,
    question: "What does it mean when an email is shown in bold text?",
    options: [
      "The email is starred",
      "The email is unread",
      "The email has attachments",
      "The email is from a contact",
    ],
    correctAnswer: 1,
    explanation: "Bold text indicates that an email is unread. Once you open it, it will appear in regular text.",
  },
  {
    id: 5,
    question: "What should you write in the Subject field of an email?",
    options: [
      "Your name",
      "The recipient's email",
      "A brief description of what the email is about",
      "Your phone number",
    ],
    correctAnswer: 2,
    explanation: "The subject line should briefly describe what your email is about so the recipient knows the topic.",
  },
];

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(QUIZ_QUESTIONS.length).fill(-1));
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (selectedAnswers[currentQuestion] === -1) {
      Alert.alert("Please select an answer", "You must select an answer before continuing.");
      return;
    }

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score
      let correctCount = 0;
      QUIZ_QUESTIONS.forEach((q, index) => {
        if (selectedAnswers[index] === q.correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResults(true);

      // Update module progress
      const percentage = (correctCount / QUIZ_QUESTIONS.length) * 100;
      if (percentage >= 70) {
        updateModuleProgress(Number(id), "Completed");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(QUIZ_QUESTIONS.length).fill(-1));
    setShowResults(false);
    setScore(0);
  };

  const handleFinish = () => {
    router.back();
  };

  if (showResults) {
    const percentage = (score / QUIZ_QUESTIONS.length) * 100;
    const passed = percentage >= 70;

    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1">
          {/* Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <Text className="text-[24px] font-bold text-gray-900">
              Quiz Results
            </Text>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            {/* Score Card */}
            <View
              className={`rounded-2xl p-6 mb-6 ${
                passed ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
              }`}
            >
              <View className="items-center">
                <Ionicons
                  name={passed ? "checkmark-circle" : "information-circle"}
                  size={64}
                  color={passed ? "#16a34a" : "#ea580c"}
                />
                <Text
                  className={`text-[28px] font-bold mt-4 ${
                    passed ? "text-green-700" : "text-orange-700"
                  }`}
                >
                  {score} / {QUIZ_QUESTIONS.length}
                </Text>
                <Text className="text-[16px] text-gray-600 mt-2">
                  {passed ? "Great job! You passed!" : "Keep practicing!"}
                </Text>
                <Text className="text-[14px] text-gray-500 mt-1">
                  {percentage.toFixed(0)}% correct
                </Text>
              </View>
            </View>

            {/* Answers Review */}
            <Text className="text-[18px] font-bold text-gray-900 mb-4">
              Review Your Answers
            </Text>

            {QUIZ_QUESTIONS.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.correctAnswer;
              
              return (
                <View
                  key={question.id}
                  className="mb-4 rounded-2xl border border-gray-200 p-5 bg-white"
                >
                  <View className="flex-row items-start mb-3">
                    <Ionicons
                      name={isCorrect ? "checkmark-circle" : "close-circle"}
                      size={24}
                      color={isCorrect ? "#16a34a" : "#dc2626"}
                    />
                    <Text className="flex-1 ml-3 text-[15px] font-semibold text-gray-900">
                      {question.question}
                    </Text>
                  </View>

                  <Text className="text-[14px] text-gray-600 mb-2">
                    Your answer: {question.options[selectedAnswers[index]]}
                  </Text>

                  {!isCorrect && (
                    <Text className="text-[14px] text-green-700 mb-2">
                      Correct answer: {question.options[question.correctAnswer]}
                    </Text>
                  )}

                  <View className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <Text className="text-[13px] text-blue-900">
                      💡 {question.explanation}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View className="px-6 py-4 border-t border-gray-200 gap-3">
            {!passed && (
              <TouchableOpacity
                onPress={handleRetake}
                className="bg-blue-600 rounded-2xl py-4 items-center"
              >
                <Text className="text-white text-[16px] font-semibold">
                  Retake Quiz
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={handleFinish}
              className={`rounded-2xl py-4 items-center ${
                passed ? "bg-green-600" : "bg-gray-600"
              }`}
            >
              <Text className="text-white text-[16px] font-semibold">
                {passed ? "Continue" : "Back to Module"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const question = QUIZ_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-[16px] font-semibold text-gray-900">
              Gmail Quiz
            </Text>
            <Text className="text-[14px] text-gray-500">
              {currentQuestion + 1}/{QUIZ_QUESTIONS.length}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-600"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Question */}
        <ScrollView className="flex-1 px-6 py-6">
          <Text className="text-[20px] font-bold text-gray-900 mb-6">
            {question.question}
          </Text>

          {/* Answer Options */}
          <View className="gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion] === index;
              
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleAnswerSelect(index)}
                  className={`rounded-2xl border-2 p-5 ${
                    isSelected
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                    <Text
                      className={`flex-1 ml-4 text-[15px] ${
                        isSelected ? "text-green-900 font-semibold" : "text-gray-700"
                      }`}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View className="px-6 py-4 border-t border-gray-200">
          <View className="flex-row gap-3">
            {currentQuestion > 0 && (
              <TouchableOpacity
                onPress={handlePrevious}
                className="flex-1 border border-gray-300 rounded-2xl py-4 items-center"
              >
                <Text className="text-gray-700 text-[16px] font-semibold">
                  Previous
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              onPress={handleNext}
              className="flex-1 bg-green-600 rounded-2xl py-4 items-center"
            >
              <Text className="text-white text-[16px] font-semibold">
                {currentQuestion === QUIZ_QUESTIONS.length - 1 ? "Submit" : "Next"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}