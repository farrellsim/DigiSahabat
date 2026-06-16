import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  Pressable,
  Animated,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { setSession, getSession } from "../../lib/protoSession";
import {
  t,
  setLanguage,
  refreshTranslations,
  initDB,
} from "../../src/services/db";

// Question structure with translation keys
const ASSESSMENT_QUESTIONS = [
  { id: 1, category: "basic", key: "q1" },
  { id: 2, category: "basic", key: "q2" },
  { id: 3, category: "communication", key: "q3" },
  { id: 4, category: "navigation", key: "q4" },
  { id: 5, category: "communication", key: "q5" },
  { id: 6, category: "intermediate", key: "q6" },
  { id: 7, category: "advanced", key: "q7" },
  { id: 8, category: "safety", key: "q8" },
];

// Points for each option (same across all languages)
const OPTION_POINTS = [3, 2, 1, 0];

// Skill level determination
const getSkillLevel = (totalScore: number, maxScore: number) => {
  const percentage = (totalScore / maxScore) * 100;

  if (percentage >= 75) {
    return {
      level: "advanced",
      key: "advanced",
      icon: "trophy",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      recommendedModules: ["youtube", "onlineshopping", "onlinebanking"],
    };
  } else if (percentage >= 50) {
    return {
      level: "intermediate",
      key: "intermediate",
      icon: "ribbon",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      recommendedModules: ["gmail", "whatsapp", "googlemaps", "youtube"],
    };
  } else if (percentage >= 25) {
    return {
      level: "beginner",
      key: "beginner",
      icon: "star",
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      recommendedModules: ["gmail", "whatsapp", "googlemaps"],
    };
  } else {
    return {
      level: "novice",
      key: "novice",
      icon: "heart",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      recommendedModules: ["gmail", "whatsapp"],
    };
  }
};

export default function LiteracyAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(
    new Array(ASSESSMENT_QUESTIONS.length).fill(-1),
  );
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(-1);
  const [started, setStarted] = useState(false);

  // Assessment Intro Animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Initialize language
  useEffect(() => {
    const loadLanguage = async () => {
      const session = await getSession();
      if (session.language) {
        setLanguage(session.language);
        refreshTranslations();
        initDB();
      }
    };
    loadLanguage();
  }, []);

  const question = ASSESSMENT_QUESTIONS[currentQuestion];
  const isLastQuestion = currentQuestion === ASSESSMENT_QUESTIONS.length - 1;
  const canProceed = selectedOption !== -1;

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === -1) {
      Alert.alert(
        t("assessment.pleaseSelect") || "Please select an answer",
        t("assessment.selectToContinue") || "Choose an option to continue.",
      );
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestion] = selectedOption;
    setAnswers(newAnswers);

    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(newAnswers[currentQuestion + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1]);
    }
  };

  const handleSkip = async () => {
    await setSession({
      literacyLevel: "beginner",
      assessmentCompleted: false,
      recommendedModules: [1, 2, 3],
    });
    router.replace("/(auth)/signup");
  };

  const handleContinue = async () => {
    let totalScore = 0;
    answers.forEach((answerIndex) => {
      if (answerIndex !== -1) {
        totalScore += OPTION_POINTS[answerIndex];
      }
    });

    const maxScore = ASSESSMENT_QUESTIONS.length * 3; // Max 3 points per question
    const skillLevel = getSkillLevel(totalScore, maxScore);

    await setSession({
      literacyLevel: skillLevel.level,
      literacyScore: totalScore,
      assessmentCompleted: true,
      recommendedModules: skillLevel.recommendedModules,
    });

    router.replace("/(auth)/signup");
  };

  // Results View
  if (showResults) {
    const totalScore = answers.reduce((sum, answerIndex) => {
      if (answerIndex !== -1) {
        return sum + OPTION_POINTS[answerIndex];
      }
      return sum;
    }, 0);

    const maxScore = ASSESSMENT_QUESTIONS.length * 3;
    const skillLevel = getSkillLevel(totalScore, maxScore);

    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-10 pb-6">
            {/* Results Card */}
            <View
              className={`rounded-3xl p-6 mb-6 ${skillLevel.bgColor} border-2 ${skillLevel.borderColor}`}
            >
              <View className="items-center">
                <View className="w-20 h-20 rounded-full bg-white items-center justify-center mb-4">
                  <Ionicons
                    name={skillLevel.icon as any}
                    size={40}
                    color={skillLevel.color.replace("text-", "#")}
                  />
                </View>

                <Text className={`text-[28px] font-bold ${skillLevel.color}`}>
                  {t(`assessment.levels.${skillLevel.key}.title`)}
                </Text>

                <Text className="text-[15px] text-gray-600 text-center mt-2">
                  {t(`assessment.levels.${skillLevel.key}.description`)}
                </Text>

                <View className="flex-row items-center mt-4">
                  <Text className="text-[20px] font-bold text-gray-900">
                    {totalScore}
                  </Text>
                  <Text className="text-[16px] text-gray-500 ml-1">
                    / {maxScore} {t("ui.points") || "points"}
                  </Text>
                </View>

                <View className="w-full mt-4">
                  <View className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${(totalScore / maxScore) * 100}%` }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* What This Means */}
            <View className="rounded-2xl bg-gray-50 border border-gray-200 p-5 mb-6">
              <View className="flex-row items-center mb-3">
                <Ionicons name="information-circle" size={24} color="#16a34a" />
                <Text className="text-[16px] font-bold text-gray-900 ml-2">
                  {t("assessment.whatThisMeans")}
                </Text>
              </View>

              <Text className="text-[14px] text-gray-700 leading-6 mb-3">
                {t("assessment.whatThisMeansDesc")}
              </Text>

              <View className="flex-row items-start mb-2">
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#16a34a"
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-[13px] text-gray-600 ml-2">
                  {t("assessment.personalizedPath")}
                </Text>
              </View>

              <View className="flex-row items-start mb-2">
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#16a34a"
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-[13px] text-gray-600 ml-2">
                  {t("assessment.rightLevel")}
                </Text>
              </View>

              <View className="flex-row items-start">
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#16a34a"
                  style={{ marginTop: 2 }}
                />
                <Text className="flex-1 text-[13px] text-gray-600 ml-2">
                  {t("assessment.ownPace")}
                </Text>
              </View>
            </View>

            {/* Recommended Modules Preview */}
            <View className="mb-6">
              <Text className="text-[16px] font-bold text-gray-900 mb-3">
                {t("assessment.recommendedForYou")}
              </Text>

              <View className="rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 border border-green-200 p-4">
                <Text className="text-[14px] text-gray-700 mb-2">
                  {t("assessment.modulesSelected", {
                    count: skillLevel.recommendedModules.length,
                  })}
                </Text>

                <View className="flex-row flex-wrap gap-2 mt-2">
                  {skillLevel.recommendedModules.map((moduleId) => (
                    <View
                      key={moduleId}
                      className="bg-white px-3 py-2 rounded-full border border-gray-200"
                    >
                      <Text className="text-[12px] text-gray-700 font-medium">
                        {t(`modules.${moduleId}.title`) || "Module"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <TouchableOpacity
              onPress={handleContinue}
              className="rounded-2xl bg-green-600 py-4 items-center mb-3"
              style={{
                shadowOpacity: 0.2,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }}
            >
              <Text className="text-white text-[16px] font-bold">
                {t("assessment.continueSignup")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers(new Array(ASSESSMENT_QUESTIONS.length).fill(-1));
                setSelectedOption(-1);
              }}
              className="rounded-2xl border border-gray-300 py-3 items-center"
            >
              <Text className="text-gray-700 text-[15px] font-semibold">
                {t("assessment.retakeAssessment")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Assessment View
  if (!started) {
    refreshTranslations();
    return (
      <Pressable
        className="flex-1 bg-green-600 justify-center items-center px-8"
        onPress={() => setStarted(true)}
      >
        <View className="items-center">
          <Text className="text-white text-2xl font-bold text-center">
            {t("splash.title")}
          </Text>

          <Animated.Text
            style={{ transform: [{ scale: scaleAnim }] }}
            className="text-white text-base mt-6"
          >
            {t("splash.subtitle")}
          </Animated.Text>
        </View>
      </Pressable>
    );
  }

  // Question View
  const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const questionText = t(`assessment.questions.${question.key}.question`);
  const options = t(`assessment.questions.${question.key}.options`);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>

            <Text className="text-[15px] font-semibold text-gray-700">
              {t("assessment.questionOf", {
                current: currentQuestion + 1,
                total: ASSESSMENT_QUESTIONS.length,
              })}
            </Text>

            <TouchableOpacity onPress={handleSkip}>
              <Text className="text-[14px] text-green-600 font-semibold">
                {t("assessment.skip")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-green-600 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Question Content */}
        <ScrollView className="flex-1 px-6">
          <View className="mb-6">
            <View className="w-12 h-12 rounded-full bg-green-100 items-center justify-center mb-4">
              <Text className="text-[20px]">
                {currentQuestion + 1 <= 3
                  ? "📱"
                  : currentQuestion + 1 <= 6
                    ? "💬"
                    : "🔒"}
              </Text>
            </View>

            <Text className="text-[22px] font-bold text-gray-900 leading-8">
              {questionText}
            </Text>
          </View>

          {/* Options */}
          <View className="gap-3 mb-6">
            {Array.isArray(options) &&
              options.map((optionText: string, index: number) => {
                const isSelected = selectedOption === index;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleOptionSelect(index)}
                    className={`rounded-2xl border-2 p-5 ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                    style={{
                      shadowOpacity: isSelected ? 0.1 : 0.04,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 2 },
                      elevation: isSelected ? 3 : 1,
                    }}
                  >
                    <View className="flex-row items-center">
                      <View
                        className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
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
                        className={`flex-1 text-[15px] ${
                          isSelected
                            ? "text-green-900 font-semibold"
                            : "text-gray-700"
                        }`}
                      >
                        {optionText}
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
                  {t("assessment.previous")}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleNext}
              disabled={!canProceed}
              className={`flex-1 rounded-2xl py-4 items-center ${
                canProceed ? "bg-green-600" : "bg-gray-300"
              }`}
            >
              <Text className="text-white text-[16px] font-bold">
                {isLastQuestion
                  ? t("assessment.seeResults")
                  : t("assessment.next")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
