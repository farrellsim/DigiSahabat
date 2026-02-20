import React, { useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Import your database services
import { getLessonById, markLessonComplete } from "../../../src/services/db";

// Simulated Gmail inbox data
const GMAIL_EMAILS = [
  {
    id: 1,
    sender: "Google Team",
    subject: "Welcome to Gmail!",
    preview: "Discover tips and tricks to get the most out of Gmail...",
    time: "9:30 AM",
    unread: true,
    starred: false,
    body: "Welcome to Gmail! We're excited to have you here. Gmail helps you stay organized with features like labels, filters, and powerful search. Get started by exploring your inbox!",
  },
  {
    id: 2,
    sender: "Newsletter",
    subject: "Your Weekly Tech Update",
    preview: "Check out the latest news in technology and innovation...",
    time: "Yesterday",
    unread: true,
    starred: true,
    body: "Here are this week's top technology stories: AI advances, new smartphone releases, and cybersecurity tips. Stay informed with our weekly digest!",
  },
  {
    id: 3,
    sender: "Bank Alerts",
    subject: "Account Statement Ready",
    preview: "Your monthly account statement is now available...",
    time: "2 days ago",
    unread: false,
    starred: false,
    body: "Your account statement for this month is ready to view. Log in to your account to download your statement. Thank you for banking with us!",
  },
];

export default function LessonScreen() {
  const { id } = useLocalSearchParams();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Gmail simulation states
  const [currentView, setCurrentView] = useState<"inbox" | "email" | "compose">("inbox");
  const [emails, setEmails] = useState(GMAIL_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Compose email states
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // Tutorial overlay states
  const [showHint, setShowHint] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const lessonData = getLessonById(Number(id));
          setLesson(lessonData);
          
          // Set initial tutorial step based on lesson content
          if (lessonData?.content_type === "inbox_basics") {
            setCurrentView("inbox");
            setCurrentStep(0);
          } else if (lessonData?.content_type === "reading_email") {
            setCurrentView("inbox");
            setCurrentStep(0);
          } else if (lessonData?.content_type === "compose_email") {
            setCurrentView("inbox");
            setCurrentStep(0);
          }
        } catch (e) {
          console.error("Failed to load lesson:", e);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [id])
  );

  const getTutorialText = () => {
    if (!lesson) return "";
    
    switch (lesson.content_type) {
      case "inbox_basics":
        const inboxSteps = [
          "Welcome! This is your Gmail inbox. Here you can see all your emails.",
          "Tap on the ⭐ icon to star important emails.",
          "Try tapping on an email to read it!",
        ];
        return inboxSteps[currentStep] || "";
        
      case "reading_email":
        const readingSteps = [
          "Tap on any email to open and read it.",
          "Great! You can see the full email content here.",
          "Use the back arrow to return to your inbox.",
        ];
        return readingSteps[currentStep] || "";
        
      case "compose_email":
        const composeSteps = [
          "Let's learn how to write an email. Tap the ✏️ Compose button.",
          "Fill in the recipient's email address in the 'To' field.",
          "Add a subject line and your message, then tap Send!",
        ];
        return composeSteps[currentStep] || "";
        
      default:
        return "Follow the instructions to learn Gmail basics!";
    }
  };

  const handleStarEmail = (emailId: number) => {
    setEmails(emails.map(e => 
      e.id === emailId ? { ...e, starred: !e.starred } : e
    ));
    
    if (lesson?.content_type === "inbox_basics" && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleEmailPress = (email: any) => {
    setSelectedEmail(email);
    setCurrentView("email");
    setEmails(emails.map(e => 
      e.id === email.id ? { ...e, unread: false } : e
    ));
    
    if (lesson?.content_type === "inbox_basics" && currentStep === 2) {
      setCurrentStep(3);
    }
    
    if (lesson?.content_type === "reading_email" && currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const handleBackToInbox = () => {
    setCurrentView("inbox");
    setSelectedEmail(null);
    
    if (lesson?.content_type === "reading_email" && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleComposePress = () => {
    setCurrentView("compose");
    
    if (lesson?.content_type === "compose_email" && currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const handleSendEmail = () => {
    if (!composeTo || !composeSubject || !composeBody) {
      Alert.alert("Missing Information", "Please fill in all fields to send an email.");
      return;
    }
    
    Alert.alert("Success!", "Your email has been sent! ✓");
    setCurrentView("inbox");
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    
    if (lesson?.content_type === "compose_email" && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleCompleteLesson = () => {
    markLessonComplete(Number(id));
    Alert.alert(
      "Lesson Complete! 🎉",
      "Great job! You've completed this lesson.",
      [{ text: "Continue", onPress: () => router.back() }]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        {/* Lesson Header */}
        <View className="px-6 py-4 bg-green-600">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-[16px] font-semibold flex-1 text-center">
              {lesson?.title}
            </Text>
            <TouchableOpacity onPress={() => setShowHint(!showHint)}>
              <Ionicons name="help-circle-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tutorial Hint Overlay */}
        {showHint && getTutorialText() && (
          <View className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#2563eb" />
              <Text className="flex-1 text-[14px] text-blue-900 ml-3">
                {getTutorialText()}
              </Text>
              <TouchableOpacity onPress={() => setShowHint(false)}>
                <Ionicons name="close" size={20} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Simulated Gmail Interface */}
        <View className="flex-1">
          {/* INBOX VIEW */}
          {currentView === "inbox" && (
            <View className="flex-1">
              {/* Gmail Header */}
              <View className="px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-[24px] font-bold text-red-600">Gmail</Text>
                  <TouchableOpacity>
                    <Ionicons name="menu" size={24} color="#5f6368" />
                  </TouchableOpacity>
                </View>
                
                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-lg px-4 py-3">
                  <Ionicons name="search" size={20} color="#5f6368" />
                  <TextInput
                    placeholder="Search in mail"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    className="flex-1 ml-3 text-[14px]"
                  />
                </View>
              </View>

              {/* Compose Button */}
              <TouchableOpacity
                onPress={handleComposePress}
                className="mx-6 mt-4 bg-blue-600 rounded-full py-3 flex-row items-center justify-center"
                style={{
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                }}
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text className="text-white text-[15px] font-semibold ml-2">
                  Compose
                </Text>
              </TouchableOpacity>

              {/* Email List */}
              <ScrollView className="flex-1 mt-4">
                {emails.map((email) => (
                  <TouchableOpacity
                    key={email.id}
                    onPress={() => handleEmailPress(email)}
                    className={`px-6 py-4 border-b border-gray-100 ${
                      email.unread ? "bg-blue-50" : "bg-white"
                    }`}
                  >
                    <View className="flex-row items-start">
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleStarEmail(email.id);
                        }}
                        className="mr-3 mt-1"
                      >
                        <Ionicons
                          name={email.starred ? "star" : "star-outline"}
                          size={20}
                          color={email.starred ? "#f59e0b" : "#9ca3af"}
                        />
                      </TouchableOpacity>

                      <View className="flex-1">
                        <Text
                          className={`text-[15px] ${
                            email.unread ? "font-bold text-gray-900" : "font-normal text-gray-700"
                          }`}
                        >
                          {email.sender}
                        </Text>
                        <Text
                          className={`text-[14px] mt-1 ${
                            email.unread ? "font-semibold text-gray-800" : "text-gray-600"
                          }`}
                        >
                          {email.subject}
                        </Text>
                        <Text className="text-[13px] text-gray-500 mt-1" numberOfLines={1}>
                          {email.preview}
                        </Text>
                      </View>

                      <Text className="text-[12px] text-gray-400 ml-2">
                        {email.time}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* EMAIL DETAIL VIEW */}
          {currentView === "email" && selectedEmail && (
            <View className="flex-1">
              {/* Email Header */}
              <View className="px-6 py-4 border-b border-gray-200">
                <View className="flex-row items-center mb-4">
                  <TouchableOpacity onPress={handleBackToInbox}>
                    <Ionicons name="arrow-back" size={24} color="#5f6368" />
                  </TouchableOpacity>
                  <View className="flex-1" />
                  <TouchableOpacity className="mr-4">
                    <Ionicons name="archive-outline" size={22} color="#5f6368" />
                  </TouchableOpacity>
                  <TouchableOpacity className="mr-4">
                    <Ionicons name="trash-outline" size={22} color="#5f6368" />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={22} color="#5f6368" />
                  </TouchableOpacity>
                </View>

                <Text className="text-[22px] font-bold text-gray-900">
                  {selectedEmail.subject}
                </Text>
              </View>

              {/* Email Content */}
              <ScrollView className="flex-1 px-6 py-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-red-500 items-center justify-center">
                    <Text className="text-white font-bold text-[16px]">
                      {selectedEmail.sender.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-[15px] font-semibold text-gray-900">
                      {selectedEmail.sender}
                    </Text>
                    <Text className="text-[13px] text-gray-500">
                      {selectedEmail.time}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleStarEmail(selectedEmail.id)}>
                    <Ionicons
                      name={selectedEmail.starred ? "star" : "star-outline"}
                      size={22}
                      color={selectedEmail.starred ? "#f59e0b" : "#9ca3af"}
                    />
                  </TouchableOpacity>
                </View>

                <Text className="text-[15px] text-gray-700 leading-6 mb-6">
                  {selectedEmail.body}
                </Text>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-4">
                  <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-3 items-center">
                    <Text className="text-[14px] font-medium text-gray-700">Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-3 items-center">
                    <Text className="text-[14px] font-medium text-gray-700">Forward</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          )}

          {/* COMPOSE EMAIL VIEW */}
          {currentView === "compose" && (
            <View className="flex-1">
              {/* Compose Header */}
              <View className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex-row items-center justify-between">
                <Text className="text-[18px] font-semibold text-gray-900">
                  Compose
                </Text>
                <View className="flex-row items-center gap-4">
                  <TouchableOpacity>
                    <Ionicons name="attach-outline" size={22} color="#5f6368" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSendEmail}>
                    <Ionicons name="send" size={22} color="#1a73e8" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCurrentView("inbox")}>
                    <Ionicons name="close" size={24} color="#5f6368" />
                  </TouchableOpacity>
                </View>
              </View>

              <ScrollView className="flex-1">
                {/* To Field */}
                <View className="px-6 py-3 border-b border-gray-200">
                  <Text className="text-[12px] text-gray-500 mb-2">To</Text>
                  <TextInput
                    placeholder="Recipient email"
                    value={composeTo}
                    onChangeText={setComposeTo}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-[15px] text-gray-900"
                  />
                </View>

                {/* Subject Field */}
                <View className="px-6 py-3 border-b border-gray-200">
                  <Text className="text-[12px] text-gray-500 mb-2">Subject</Text>
                  <TextInput
                    placeholder="Email subject"
                    value={composeSubject}
                    onChangeText={setComposeSubject}
                    className="text-[15px] text-gray-900"
                  />
                </View>

                {/* Body Field */}
                <View className="px-6 py-4">
                  <Text className="text-[12px] text-gray-500 mb-2">Message</Text>
                  <TextInput
                    placeholder="Compose email"
                    value={composeBody}
                    onChangeText={setComposeBody}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                    className="text-[15px] text-gray-900 min-h-[200px]"
                  />
                </View>
              </ScrollView>

              {/* Send Button */}
              <View className="px-6 py-4 border-t border-gray-200">
                <TouchableOpacity
                  onPress={handleSendEmail}
                  className="bg-blue-600 rounded-lg py-4 items-center"
                >
                  <Text className="text-white text-[16px] font-semibold">Send Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Complete Lesson Button */}
        {currentStep >= 3 && (
          <View className="px-6 py-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleCompleteLesson}
              className="bg-green-600 rounded-2xl py-4 items-center"
            >
              <Text className="text-white text-[16px] font-semibold">
                Complete Lesson ✓
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}