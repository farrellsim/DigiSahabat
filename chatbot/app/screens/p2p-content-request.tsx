import React, { useState, useEffect } from "react";
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

// Import services
import p2pService, { TransferProgress } from "../../src/services/p2p";
import { getModules } from "../../src/services/db";

export default function P2PContentRequestScreen() {
  const { peerId, peerName } = useLocalSearchParams();
  const [availableModules, setAvailableModules] = useState<any[]>([]);
  const [selectedModules, setSelectedModules] = useState<Set<number>>(new Set());
  const [transfers, setTransfers] = useState<TransferProgress[]>([]);
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    loadAvailableModules();
    
    // Set up transfer progress callback
    p2pService.setCallbacks({
      onTransferProgress: handleTransferProgress,
    });
  }, []);

  const loadAvailableModules = () => {
    // Get peer's available modules
    const peers = p2pService.getConnectedPeers();
    const peer = peers.find((p) => p.id === peerId);
    
    if (peer) {
      const allModules = getModules();
      const available = allModules.filter((m) =>
        peer.availableModules.includes(m.id)
      );
      setAvailableModules(available);
    }
  };

  const handleTransferProgress = (progress: TransferProgress) => {
    setTransfers((prev) => {
      const index = prev.findIndex(
        (t) => t.peerId === progress.peerId && t.moduleId === progress.moduleId
      );
      
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = progress;
        return updated;
      } else {
        return [...prev, progress];
      }
    });
  };

  const toggleModuleSelection = (moduleId: number) => {
    setSelectedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedModules.size === availableModules.length) {
      setSelectedModules(new Set());
    } else {
      setSelectedModules(new Set(availableModules.map((m) => m.id)));
    }
  };

  const startTransfer = async () => {
    if (selectedModules.size === 0) {
      Alert.alert("No Selection", "Please select at least one module");
      return;
    }

    try {
      setIsTransferring(true);
      const moduleIds = Array.from(selectedModules);
      
      await p2pService.requestContent(peerId as string, moduleIds);
      
      Alert.alert(
        "Transfer Started",
        `Requesting ${moduleIds.length} module(s) from ${peerName}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Transfer failed:", error);
      Alert.alert("Transfer Failed", "Could not start transfer");
      setIsTransferring(false);
    }
  };

  const cancelTransfer = async () => {
    Alert.alert(
      "Cancel Transfer",
      "Are you sure you want to cancel all transfers?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            // Cancel logic here
            setIsTransferring(false);
            setTransfers([]);
          },
        },
      ]
    );
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond} B/s`;
    if (bytesPerSecond < 1024 * 1024)
      return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "bg-green-50", text: "text-green-700", icon: "#16a34a" };
      case "transferring":
        return { bg: "bg-blue-50", text: "text-blue-700", icon: "#2563eb" };
      case "failed":
        return { bg: "bg-red-50", text: "text-red-700", icon: "#ef4444" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", icon: "#6B7280" };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-[18px] font-bold text-gray-900 flex-1 text-center">
              Get Modules
            </Text>
            <View className="w-6" />
          </View>

          <View className="flex-row items-center justify-center">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="phone-portrait" size={20} color="#2563eb" />
            </View>
            <Text className="text-[15px] text-gray-700">
              From: <Text className="font-semibold">{peerName}</Text>
            </Text>
          </View>
        </View>

        {/* Active Transfers */}
        {transfers.length > 0 && (
          <View className="px-6 py-4 bg-white mb-2">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[14px] font-semibold text-gray-900">
                Active Transfers
              </Text>
              <TouchableOpacity onPress={cancelTransfer}>
                <Text className="text-[13px] text-red-600 font-medium">
                  Cancel All
                </Text>
              </TouchableOpacity>
            </View>

            {transfers.map((transfer) => {
              const module = availableModules.find(
                (m) => m.id === transfer.moduleId
              );
              const statusStyle = getStatusColor(transfer.status);

              return (
                <View
                  key={`${transfer.peerId}_${transfer.moduleId}`}
                  className={`rounded-2xl border p-4 mb-3 ${statusStyle.bg} border-gray-200`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-[14px] font-semibold text-gray-900 flex-1">
                      {module?.title || `Module ${transfer.moduleId}`}
                    </Text>
                    <Text className={`text-[12px] font-medium ${statusStyle.text}`}>
                      {transfer.progress.toFixed(0)}%
                    </Text>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <View
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${transfer.progress}%` }}
                    />
                  </View>

                  <View className="flex-row items-center justify-between">
                    <Text className="text-[11px] text-gray-600">
                      {formatSize(transfer.transferredSize)} / {formatSize(transfer.totalSize)}
                    </Text>
                    {transfer.speed > 0 && (
                      <Text className="text-[11px] text-gray-600">
                        {formatSpeed(transfer.speed)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Module Selection */}
        <View className="px-6 py-4 bg-white mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-[14px] font-semibold text-gray-900">
              Available Modules ({availableModules.length})
            </Text>
            <TouchableOpacity onPress={selectAll}>
              <Text className="text-[13px] text-green-600 font-medium">
                {selectedModules.size === availableModules.length
                  ? "Deselect All"
                  : "Select All"}
              </Text>
            </TouchableOpacity>
          </View>

          {availableModules.length === 0 && (
            <View className="items-center py-10">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-3">
                <Ionicons name="folder-open-outline" size={32} color="#9CA3AF" />
              </View>
              <Text className="text-[14px] text-gray-500">
                No modules available
              </Text>
            </View>
          )}
        </View>

        {/* Module List */}
        <ScrollView className="flex-1">
          <View className="px-6 pb-6">
            {availableModules.map((module) => {
              const isSelected = selectedModules.has(module.id);
              const isTransferring = transfers.some(
                (t) => t.moduleId === module.id && t.status === "transferring"
              );
              const isCompleted = transfers.some(
                (t) => t.moduleId === module.id && t.status === "completed"
              );

              return (
                <TouchableOpacity
                  key={module.id}
                  onPress={() => toggleModuleSelection(module.id)}
                  disabled={isTransferring || isCompleted}
                  className={`rounded-2xl border-2 p-4 mb-3 ${
                    isCompleted
                      ? "border-green-200 bg-green-50"
                      : isSelected
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                  style={{
                    opacity: isTransferring || isCompleted ? 0.6 : 1,
                  }}
                >
                  <View className="flex-row items-start">
                    <View
                      className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${
                        isCompleted || isSelected
                          ? "border-green-600 bg-green-600"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {(isCompleted || isSelected) && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>

                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-gray-900">
                        {module.title}
                      </Text>
                      <Text className="text-[13px] text-gray-600 mt-1">
                        {module.desc}
                      </Text>

                      <View className="flex-row items-center mt-2">
                        <Ionicons name="time-outline" size={14} color="#6B7280" />
                        <Text className="text-[12px] text-gray-500 ml-1">
                          {module.mins} mins
                        </Text>
                      </View>

                      {isCompleted && (
                        <View className="mt-2 flex-row items-center">
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#16a34a"
                          />
                          <Text className="text-[12px] text-green-700 ml-1 font-medium">
                            Transfer Complete
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Action Button */}
        {!isTransferring && transfers.length === 0 && (
          <View className="px-6 py-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={startTransfer}
              disabled={selectedModules.size === 0}
              className={`rounded-2xl py-4 items-center ${
                selectedModules.size === 0 ? "bg-gray-300" : "bg-green-600"
              }`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="download"
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-white text-[16px] font-bold">
                  Get {selectedModules.size} Module{selectedModules.size !== 1 ? "s" : ""}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}