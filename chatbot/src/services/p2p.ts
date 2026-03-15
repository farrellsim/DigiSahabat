// src/services/p2p.ts
// Peer-to-Peer Service for DigiSahabat (Updated - No Expo Crypto)
// Handles device discovery, connection, and content distribution

import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import CryptoJS from "crypto-js"; // We'll use this instead

// Types
export interface Peer {
  id: string;
  name: string;
  deviceType: "android" | "ios";
  distance: "near" | "medium" | "far";
  isSource: boolean;
  contentVersion: string;
  availableModules: number[];
  lastSeen: Date;
  signalStrength: number;
}

export interface ContentPackage {
  moduleId: number;
  version: string;
  timestamp: number;
  checksum: string;
  data: any;
  size: number;
}

export interface TransferProgress {
  peerId: string;
  moduleId: number;
  progress: number;
  totalSize: number;
  transferredSize: number;
  status: "pending" | "transferring" | "completed" | "failed";
  speed: number; // bytes per second
}

export interface MergeConflict {
  moduleId: number;
  localVersion: string;
  remoteVersion: string;
  commonAncestor: string;
  conflictType: "progress" | "content" | "both";
  timestamp: number;
}

// Mock Native Modules (for development without native implementation)
const MockWiFiDirect = {
  initialize: () => Promise.resolve(),
  startDiscovery: () => Promise.resolve(),
  stopDiscovery: () => Promise.resolve(),
  startAdvertising: (data: any) => Promise.resolve(),
  stopAdvertising: () => Promise.resolve(),
  connectToPeer: (peerId: string) => Promise.resolve(),
  disconnectFromPeer: (peerId: string) => Promise.resolve(),
  acceptConnection: (peerId: string) => Promise.resolve(),
  rejectConnection: (peerId: string) => Promise.resolve(),
  sendData: (peerId: string, data: string) => Promise.resolve(),
};

const MockMultipeer = {
  initialize: (serviceType: string) => Promise.resolve(),
  startDiscovery: () => Promise.resolve(),
  stopDiscovery: () => Promise.resolve(),
  startAdvertising: (data: any) => Promise.resolve(),
  stopAdvertising: () => Promise.resolve(),
  connectToPeer: (peerId: string) => Promise.resolve(),
  disconnectFromPeer: (peerId: string) => Promise.resolve(),
  acceptConnection: (peerId: string) => Promise.resolve(),
  rejectConnection: (peerId: string) => Promise.resolve(),
  sendData: (peerId: string, data: string) => Promise.resolve(),
};

// P2P Service Class
class P2PService {
  private isInitialized: boolean = false;
  private isDiscovering: boolean = false;
  private isAdvertising: boolean = false;
  private connectedPeers: Map<string, Peer> = new Map();
  private discoveredPeers: Map<string, Peer> = new Map();
  private activeTransfers: Map<string, TransferProgress> = new Map();
  private eventEmitter: any = null;
  private useSimulation: boolean = false;
  private initializationPromise: Promise<void>;

  // Device info
  private deviceId: string = "";
  private deviceName: string = "";
  private contentVersion: string = "1.0.0";

  // Callbacks
  private onPeerDiscovered?: (peer: Peer) => void;
  private onPeerLost?: (peerId: string) => void;
  private onConnectionRequest?: (peer: Peer) => Promise<boolean>;
  private onPeerConnected?: (peer: Peer) => void;
  private onPeerDisconnected?: (peerId: string) => void;
  private onTransferProgress?: (progress: TransferProgress) => void;
  private onContentReceived?: (content: ContentPackage) => void;
  private onMergeConflict?: (conflict: MergeConflict) => void;

  constructor() {
    this.initializationPromise = this.initializeService();
  }

  public async waitForInitialization(): Promise<void> {
    await this.initializationPromise;
  }

  // Initialize service with platform detection
  private async initializeService(): Promise<void> {
    try {
      // Check if native modules are available
      const hasNativeModule =
        Platform.OS === "android"
          ? NativeModules.WiFiDirect !== undefined
          : NativeModules.MultipeerConnectivity !== undefined;
      if (!hasNativeModule) {
        console.warn(
          "⚠️ Native P2P module not available. Using simulation mode for development.",
        );
        this.useSimulation = true;
        this.isInitialized = true;
      }

      if (Platform.OS === "android") {
        await this.initializeAndroidWiFiDirect();
      } else if (Platform.OS === "ios") {
        await this.initializeIOSMultipeer();
      }
      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize:", error);
      this.useSimulation = true;
      this.isInitialized = true;
    }
  }

  // Initialize Android Wi-Fi Direct
  private async initializeAndroidWiFiDirect() {
    try {
      const WiFiDirect = NativeModules.WiFiDirect;
      this.eventEmitter = new NativeEventEmitter(WiFiDirect);

      // Set up event listeners
      this.setupEventListeners();

      // Initialize Wi-Fi Direct
      await WiFiDirect.initialize();

      this.isInitialized = true;
      console.log("✅ Wi-Fi Direct initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Wi-Fi Direct:", error);
      throw error;
    }
  }

  // Initialize iOS Multipeer Connectivity
  private async initializeIOSMultipeer() {
    try {
      const Multipeer = NativeModules.MultipeerConnectivity;
      this.eventEmitter = new NativeEventEmitter(Multipeer);

      // Set up event listeners
      this.setupEventListeners();

      // Initialize Multipeer
      await Multipeer.initialize("digisahabat");

      this.isInitialized = true;
      console.log("✅ Multipeer Connectivity initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Multipeer:", error);
      throw error;
    }
  }

  // Setup event listeners
  private setupEventListeners() {
    if (!this.eventEmitter) return;

    this.eventEmitter.addListener(
      "onPeerDiscovered",
      this.handlePeerDiscovered,
    );
    this.eventEmitter.addListener("onPeerLost", this.handlePeerLost);
    this.eventEmitter.addListener(
      "onConnectionRequest",
      this.handleConnectionRequest,
    );
    this.eventEmitter.addListener("onPeerConnected", this.handlePeerConnected);
    this.eventEmitter.addListener(
      "onPeerDisconnected",
      this.handlePeerDisconnected,
    );
    this.eventEmitter.addListener("onDataReceived", this.handleDataReceived);
  }

  // Get native module or mock
  private getNativeModule() {
    if (this.useSimulation) {
      return Platform.OS === "android" ? MockWiFiDirect : MockMultipeer;
    }

    return Platform.OS === "android"
      ? NativeModules.WiFiDirect
      : NativeModules.MultipeerConnectivity;
  }

  // Set device info
  public setDeviceInfo(name: string, availableModules: number[]) {
    this.deviceName = name;
    this.deviceId = this.generateDeviceId();
  }

  // Generate unique device ID
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Start discovering peers
  public async startDiscovery(): Promise<void> {
    await this.waitForInitialization();

    if (!this.isInitialized) {
      throw new Error("P2P Service not initialized");
    }

    if (this.isDiscovering) {
      console.log("Already discovering");
      return;
    }

    try {
      const module = this.getNativeModule();
      await module.startDiscovery();
      this.isDiscovering = true;
      console.log("📡 Started peer discovery");

      // Simulate discovery in dev mode
      if (this.useSimulation) {
        this.simulateDiscovery();
      }
    } catch (error) {
      console.error("Failed to start discovery:", error);
      throw error;
    }
  }

  // Stop discovering peers
  public async stopDiscovery(): Promise<void> {
    if (!this.isDiscovering) return;

    try {
      const module = this.getNativeModule();
      await module.stopDiscovery();
      this.isDiscovering = false;
      console.log("🛑 Stopped peer discovery");
    } catch (error) {
      console.error("Failed to stop discovery:", error);
    }
  }

  // Start advertising as a source node
  public async startAdvertising(availableModules: number[]): Promise<void> {
    if (!this.isInitialized) {
      throw new Error("P2P Service not initialized");
    }

    try {
      const module = this.getNativeModule();

      const advertisementData = {
        deviceName: this.deviceName,
        deviceId: this.deviceId,
        isSource: true,
        contentVersion: this.contentVersion,
        availableModules: availableModules,
      };

      await module.startAdvertising(advertisementData);
      this.isAdvertising = true;
      console.log("📢 Started advertising as source node");
    } catch (error) {
      console.error("Failed to start advertising:", error);
      throw error;
    }
  }

  // Stop advertising
  public async stopAdvertising(): Promise<void> {
    if (!this.isAdvertising) return;

    try {
      const module = this.getNativeModule();
      await module.stopAdvertising();
      this.isAdvertising = false;
      console.log("🛑 Stopped advertising");
    } catch (error) {
      console.error("Failed to stop advertising:", error);
    }
  }

  // Connect to a peer
  public async connectToPeer(peerId: string): Promise<void> {
    const peer = this.discoveredPeers.get(peerId);
    if (!peer) {
      throw new Error("Peer not found");
    }

    try {
      const module = this.getNativeModule();
      await module.connectToPeer(peerId);
      console.log(`🔗 Connecting to peer: ${peer.name}`);

      // Simulate connection in dev mode
      if (this.useSimulation) {
        setTimeout(() => {
          this.handlePeerConnected({ ...peer, id: peerId });
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to connect to peer:", error);
      throw error;
    }
  }

  // Disconnect from a peer
  public async disconnectFromPeer(peerId: string): Promise<void> {
    if (!this.connectedPeers.has(peerId)) {
      console.log("Peer not connected");
      return;
    }

    try {
      const module = this.getNativeModule();
      await module.disconnectFromPeer(peerId);
      this.connectedPeers.delete(peerId);
      console.log(`❌ Disconnected from peer: ${peerId}`);
    } catch (error) {
      console.error("Failed to disconnect from peer:", error);
    }
  }

  // Request content from peer
  public async requestContent(
    peerId: string,
    moduleIds: number[],
  ): Promise<void> {
    if (!this.connectedPeers.has(peerId)) {
      throw new Error("Peer not connected");
    }

    try {
      const module = this.getNativeModule();

      const request = {
        type: "CONTENT_REQUEST",
        moduleIds: moduleIds,
        requesterId: this.deviceId,
        timestamp: Date.now(),
      };

      await module.sendData(peerId, JSON.stringify(request));

      // Initialize transfer tracking
      moduleIds.forEach((moduleId) => {
        const transferId = `${peerId}_${moduleId}`;
        this.activeTransfers.set(transferId, {
          peerId,
          moduleId,
          progress: 0,
          totalSize: 0,
          transferredSize: 0,
          status: "pending",
          speed: 0,
        });
      });

      console.log(
        `📥 Requested modules ${moduleIds.join(", ")} from peer ${peerId}`,
      );

      // Simulate transfer in dev mode
      if (this.useSimulation) {
        this.simulateTransfer(peerId, moduleIds);
      }
    } catch (error) {
      console.error("Failed to request content:", error);
      throw error;
    }
  }

  // Calculate checksum for data integrity (using CryptoJS instead of expo-crypto)
  private calculateChecksum(data: any): string {
    const dataString = JSON.stringify(data);
    return CryptoJS.SHA256(dataString).toString();
  }

  // Chunk large data for transmission
  private chunkData(data: any, chunkSize: number): any[] {
    const dataString = JSON.stringify(data);
    const chunks: any[] = [];

    for (let i = 0; i < dataString.length; i += chunkSize) {
      chunks.push(dataString.slice(i, i + chunkSize));
    }

    return chunks;
  }

  // Handle peer discovered event
  private handlePeerDiscovered = (peerData: any) => {
    const peer: Peer = {
      id: peerData.id,
      name: peerData.name,
      deviceType: peerData.deviceType,
      distance: this.calculateDistance(peerData.signalStrength),
      isSource: peerData.isSource || false,
      contentVersion: peerData.contentVersion || "1.0.0",
      availableModules: peerData.availableModules || [],
      lastSeen: new Date(),
      signalStrength: peerData.signalStrength || 0,
    };

    this.discoveredPeers.set(peer.id, peer);
    this.onPeerDiscovered?.(peer);
    console.log(`👤 Discovered peer: ${peer.name}`);
  };

  // Handle peer lost event
  private handlePeerLost = (peerId: string) => {
    this.discoveredPeers.delete(peerId);
    this.onPeerLost?.(peerId);
    console.log(`👋 Lost peer: ${peerId}`);
  };

  // Handle connection request
  private handleConnectionRequest = async (peerData: any) => {
    const peer: Peer = {
      id: peerData.id,
      name: peerData.name,
      deviceType: peerData.deviceType,
      distance: "near",
      isSource: peerData.isSource || false,
      contentVersion: peerData.contentVersion || "1.0.0",
      availableModules: peerData.availableModules || [],
      lastSeen: new Date(),
      signalStrength: peerData.signalStrength || 0,
    };

    // Ask user for approval
    const accepted = await this.onConnectionRequest?.(peer);

    const module = this.getNativeModule();

    if (accepted) {
      await module.acceptConnection(peerData.id);
      console.log(`✅ Accepted connection from: ${peer.name}`);
    } else {
      await module.rejectConnection(peerData.id);
      console.log(`❌ Rejected connection from: ${peer.name}`);
    }
  };

  // Handle peer connected event
  private handlePeerConnected = (peerData: any) => {
    const peer: Peer = {
      id: peerData.id,
      name: peerData.name,
      deviceType: peerData.deviceType,
      distance: "near",
      isSource: peerData.isSource || false,
      contentVersion: peerData.contentVersion || "1.0.0",
      availableModules: peerData.availableModules || [],
      lastSeen: new Date(),
      signalStrength: peerData.signalStrength || 0,
    };

    this.connectedPeers.set(peer.id, peer);
    this.onPeerConnected?.(peer);
    console.log(`🔗 Connected to peer: ${peer.name}`);
  };

  // Handle peer disconnected event
  private handlePeerDisconnected = (peerId: string) => {
    this.connectedPeers.delete(peerId);
    this.onPeerDisconnected?.(peerId);
    console.log(`❌ Disconnected from peer: ${peerId}`);
  };

  // Handle data received
  private handleDataReceived = async (data: any) => {
    try {
      const message = JSON.parse(data.message);

      switch (message.type) {
        case "CONTENT_REQUEST":
          console.log("📥 Received content request");
          break;

        case "CONTENT_CHUNK":
          await this.handleContentChunk(data.peerId, message);
          break;

        default:
          console.log("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Failed to handle received data:", error);
    }
  };

  // Handle content chunk received
  private async handleContentChunk(peerId: string, message: any) {
    const transferId = `${peerId}_${message.moduleId}`;
    const transfer = this.activeTransfers.get(transferId);

    if (!transfer) {
      console.warn("Received chunk for unknown transfer");
      return;
    }

    // Update transfer progress
    const progress = ((message.chunkIndex + 1) / message.totalChunks) * 100;
    transfer.progress = progress;
    transfer.status = progress === 100 ? "completed" : "transferring";

    this.onTransferProgress?.(transfer);

    if (progress === 100) {
      console.log(
        `✅ Completed receiving module ${message.moduleId} from ${peerId}`,
      );
    }
  }

  // Calculate distance based on signal strength
  private calculateDistance(signalStrength: number): "near" | "medium" | "far" {
    if (signalStrength > -50) return "near";
    if (signalStrength > -70) return "medium";
    return "far";
  }

  // Simulate discovery for development
  private simulateDiscovery() {
    setTimeout(() => {
      const mockPeer: Peer = {
        id: "sim_peer_1",
        name: "Test Device",
        deviceType: Platform.OS as "android" | "ios",
        distance: "near",
        isSource: true,
        contentVersion: "1.0.0",
        availableModules: [1, 2, 3],
        lastSeen: new Date(),
        signalStrength: -45,
      };
      this.handlePeerDiscovered(mockPeer);
    }, 2000);
  }

  // Simulate transfer for development
  private simulateTransfer(peerId: string, moduleIds: number[]) {
    moduleIds.forEach((moduleId, index) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;

        const transferId = `${peerId}_${moduleId}`;
        const transfer = this.activeTransfers.get(transferId);

        if (transfer) {
          transfer.progress = progress;
          transfer.status = progress === 100 ? "completed" : "transferring";
          transfer.transferredSize = (progress / 100) * 5000000; // 5MB
          transfer.totalSize = 5000000;
          transfer.speed = 512000; // 512 KB/s

          this.onTransferProgress?.(transfer);
        }

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 500);
    });
  }

  // Get discovered peers
  public getDiscoveredPeers(): Peer[] {
    return Array.from(this.discoveredPeers.values());
  }

  // Get connected peers
  public getConnectedPeers(): Peer[] {
    return Array.from(this.connectedPeers.values());
  }

  // Get active transfers
  public getActiveTransfers(): TransferProgress[] {
    return Array.from(this.activeTransfers.values());
  }

  // Set event callbacks
  public setCallbacks(callbacks: {
    onPeerDiscovered?: (peer: Peer) => void;
    onPeerLost?: (peerId: string) => void;
    onConnectionRequest?: (peer: Peer) => Promise<boolean>;
    onPeerConnected?: (peer: Peer) => void;
    onPeerDisconnected?: (peerId: string) => void;
    onTransferProgress?: (progress: TransferProgress) => void;
    onContentReceived?: (content: ContentPackage) => void;
    onMergeConflict?: (conflict: MergeConflict) => void;
  }) {
    this.onPeerDiscovered = callbacks.onPeerDiscovered;
    this.onPeerLost = callbacks.onPeerLost;
    this.onConnectionRequest = callbacks.onConnectionRequest;
    this.onPeerConnected = callbacks.onPeerConnected;
    this.onPeerDisconnected = callbacks.onPeerDisconnected;
    this.onTransferProgress = callbacks.onTransferProgress;
    this.onContentReceived = callbacks.onContentReceived;
    this.onMergeConflict = callbacks.onMergeConflict;
  }

  // Check if using simulation mode
  public isUsingSimulation(): boolean {
    return this.useSimulation;
  }

  // Cleanup
  public cleanup(): void {
    this.stopDiscovery();
    this.stopAdvertising();

    // Disconnect all peers
    this.connectedPeers.forEach((_, peerId) => {
      this.disconnectFromPeer(peerId);
    });

    // Clear maps
    this.connectedPeers.clear();
    this.discoveredPeers.clear();
    this.activeTransfers.clear();

    // Remove event listeners
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners("onPeerDiscovered");
      this.eventEmitter.removeAllListeners("onPeerLost");
      this.eventEmitter.removeAllListeners("onConnectionRequest");
      this.eventEmitter.removeAllListeners("onPeerConnected");
      this.eventEmitter.removeAllListeners("onPeerDisconnected");
      this.eventEmitter.removeAllListeners("onDataReceived");
    }

    // this.isInitialized = false;
    console.log("🧹 P2P Service cleaned up");
  }
}

// Export singleton instance
export const p2pService = new P2PService();
export default p2pService;
