import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Import P2P service
import p2pService, { Peer } from "../../src/services/p2p";
import { getModules } from "../../src/services/db";

export default function P2PDiscoveryScreen() {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isAdvertising, setIsAdvertising] = useState(false);
  const [discoveredPeers, setDiscoveredPeers] = useState<Peer[]>([]);
  const [connectedPeers, setConnectedPeers] = useState<Peer[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    // Set up P2P service callbacks
    p2pService.setCallbacks({
      onPeerDiscovered: handlePeerDiscovered,
      onPeerLost: handlePeerLost,
      onConnectionRequest: handleConnectionRequest,
      onPeerConnected: handlePeerConnected,
      onPeerDisconnected: handlePeerDisconnected,
    });

    // Cleanup on unmount
    return () => {
      p2pService.stopDiscovery();
      p2pService.stopAdvertising();
    };
  }, []);

  const handlePeerDiscovered = (peer: Peer) => {
    setDiscoveredPeers((prev) => {
      const index = prev.findIndex((p) => p.id === peer.id);
      if (index !== -1) {
        // Update existing peer
        const updated = [...prev];
        updated[index] = peer;
        return updated;
      } else {
        // Add new peer
        return [...prev, peer];
      }
    });
  };

  const handlePeerLost = (peerId: string) => {
    setDiscoveredPeers((prev) => prev.filter((p) => p.id !== peerId));
  };

  const handleConnectionRequest = async (peer: Peer): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        "Connection Request",
        `${peer.name} wants to connect. Accept?`,
        [
          {
            text: "Reject",
            style: "cancel",
            onPress: () => resolve(false),
          },
          {
            text: "Accept",
            onPress: () => resolve(true),
          },
        ]
      );
    });
  };

  const handlePeerConnected = (peer: Peer) => {
    setConnectedPeers((prev) => [...prev, peer]);
    setConnecting(null);
    Alert.alert("Connected", `Connected to ${peer.name}`);
  };

  const handlePeerDisconnected = (peerId: string) => {
    setConnectedPeers((prev) => prev.filter((p) => p.id !== peerId));
  };

  const toggleDiscovery = async () => {
    try {
      if (isDiscovering) {
        await p2pService.stopDiscovery();
        setIsDiscovering(false);
        setDiscoveredPeers([]);
      } else {
        await p2pService.startDiscovery();
        setIsDiscovering(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to toggle discovery");
      console.error(error);
    }
  };

  const toggleAdvertising = async () => {
    try {
      if (isAdvertising) {
        await p2pService.stopAdvertising();
        setIsAdvertising(false);
      } else {
        const modules = getModules();
        const completedModuleIds = modules
          .filter((m) => m.status === "Completed")
          .map((m) => m.id);
        
        await p2pService.startAdvertising(completedModuleIds);
        setIsAdvertising(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to toggle advertising");
      console.error(error);
    }
  };

  const connectToPeer = async (peer: Peer) => {
    try {
      setConnecting(peer.id);
      await p2pService.connectToPeer(peer.id);
    } catch (error) {
      setConnecting(null);
      Alert.alert("Connection Failed", `Could not connect to ${peer.name}`);
      console.error(error);
    }
  };

  const disconnectFromPeer = async (peerId: string) => {
    try {
      await p2pService.disconnectFromPeer(peerId);
    } catch (error) {
      Alert.alert("Error", "Failed to disconnect");
      console.error(error);
    }
  };

  const requestContent = (peer: Peer) => {
    router.push({
      pathname: "/screens/p2p-content-request",
      params: { peerId: peer.id, peerName: peer.name },
    });
  };

  const getDistanceIcon = (distance: string) => {
    switch (distance) {
      case "near":
        return { name: "radio-button-on", color: "#16a34a" };
      case "medium":
        return { name: "radio-button-on", color: "#f59e0b" };
      case "far":
        return { name: "radio-button-on", color: "#ef4444" };
      default:
        return { name: "radio-button-off", color: "#9ca3af" };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="text-[20px] font-bold text-gray-900">
              Share Modules
            </Text>
            <View className="w-6" />
          </View>

          {/* Status Cards */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-green-50 rounded-2xl p-3 border border-green-200">
              <Text className="text-[12px] text-green-600 mb-1">
                Discovery
              </Text>
              <Text className="text-[20px] font-bold text-green-700">
                {discoveredPeers.length}
              </Text>
              <Text className="text-[10px] text-green-600 mt-1">
                {isDiscovering ? "Scanning..." : "Inactive"}
              </Text>
            </View>

            <View className="flex-1 bg-blue-50 rounded-2xl p-3 border border-blue-200">
              <Text className="text-[12px] text-blue-600 mb-1">
                Connected
              </Text>
              <Text className="text-[20px] font-bold text-blue-700">
                {connectedPeers.length}
              </Text>
              <Text className="text-[10px] text-blue-600 mt-1">
                Active
              </Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View className="px-6 py-4 bg-white mb-2">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-gray-900">
                Find Nearby Devices
              </Text>
              <Text className="text-[12px] text-gray-500">
                Discover devices to share with
              </Text>
            </View>
            <Switch value={isDiscovering} onValueChange={toggleDiscovery} />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-gray-900">
                Share My Modules
              </Text>
              <Text className="text-[12px] text-gray-500">
                Let others discover you
              </Text>
            </View>
            <Switch value={isAdvertising} onValueChange={toggleAdvertising} />
          </View>
        </View>

        {/* Connected Peers */}
        {connectedPeers.length > 0 && (
          <View className="px-6 py-3 bg-white mb-2">
            <Text className="text-[14px] font-semibold text-gray-900 mb-3">
              Connected Devices
            </Text>

            {connectedPeers.map((peer) => (
              <View
                key={peer.id}
                className="rounded-2xl border border-blue-200 bg-blue-50 p-4 mb-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 rounded-full bg-blue-600 items-center justify-center mr-3">
                      <Ionicons name="phone-portrait" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-gray-900">
                        {peer.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons
                          name="checkmark-circle"
                          size={14}
                          color="#16a34a"
                        />
                        <Text className="text-[12px] text-gray-600 ml-1">
                          Connected
                        </Text>
                      </View>
                    </View>
                  </View>

                  {peer.isSource && (
                    <View className="px-2 py-1 rounded-full bg-green-100">
                      <Text className="text-[10px] font-semibold text-green-700">
                        SOURCE
                      </Text>
                    </View>
                  )}
                </View>

                <View className="flex-row gap-2 mt-3">
                  <TouchableOpacity
                    onPress={() => requestContent(peer)}
                    className="flex-1 bg-blue-600 rounded-xl py-2 items-center"
                  >
                    <Text className="text-white text-[13px] font-semibold">
                      Get Modules
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => disconnectFromPeer(peer.id)}
                    className="px-4 border border-gray-300 rounded-xl items-center justify-center bg-white"
                  >
                    <Ionicons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Discovered Peers */}
        <ScrollView className="flex-1">
          <View className="px-6 py-3">
            <Text className="text-[14px] font-semibold text-gray-900 mb-3">
              Nearby Devices
            </Text>

            {!isDiscovering && discoveredPeers.length === 0 && (
              <View className="items-center py-10">
                <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <Ionicons name="search" size={40} color="#9CA3AF" />
                </View>
                <Text className="text-[14px] text-gray-500 text-center">
                  Turn on discovery to find nearby devices
                </Text>
              </View>
            )}

            {isDiscovering && discoveredPeers.length === 0 && (
              <View className="items-center py-10">
                <ActivityIndicator size="large" color="#16a34a" />
                <Text className="text-[14px] text-gray-500 mt-4">
                  Searching for devices...
                </Text>
              </View>
            )}

            {discoveredPeers.map((peer) => {
              const isConnected = connectedPeers.some((p) => p.id === peer.id);
              if (isConnected) return null;

              const distanceIcon = getDistanceIcon(peer.distance);
              const isConnecting = connecting === peer.id;

              return (
                <View
                  key={peer.id}
                  className="rounded-2xl border border-gray-200 bg-white p-4 mb-3"
                  style={{
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 2 },
                    elevation: 2,
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center mr-3">
                        <Ionicons
                          name="phone-portrait-outline"
                          size={24}
                          color="#6B7280"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-[15px] font-bold text-gray-900">
                          {peer.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Ionicons
                            name={distanceIcon.name as any}
                            size={12}
                            color={distanceIcon.color}
                          />
                          <Text className="text-[12px] text-gray-500 ml-1">
                            {peer.distance}
                          </Text>
                          {peer.isSource && (
                            <>
                              <Text className="text-gray-400 mx-2">•</Text>
                              <Text className="text-[12px] text-green-600 font-medium">
                                {peer.availableModules.length} modules
                              </Text>
                            </>
                          )}
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => connectToPeer(peer)}
                      disabled={isConnecting}
                      className={`px-4 py-2 rounded-xl ${
                        isConnecting ? "bg-gray-100" : "bg-green-600"
                      }`}
                    >
                      {isConnecting ? (
                        <ActivityIndicator size="small" color="#6B7280" />
                      ) : (
                        <Text className="text-white text-[13px] font-semibold">
                          Connect
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Info Banner */}
        <View className="px-6 py-4 bg-blue-50 border-t border-blue-200">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#2563eb" />
            <Text className="flex-1 ml-3 text-[12px] text-blue-900 leading-5">
              Share learning modules with friends and family without internet.
              Turn on both switches to start sharing!
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}