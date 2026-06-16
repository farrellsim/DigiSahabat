import { Platform } from "react-native";

/**
 * Base URL of the DigiSahabat backend.
 *
 * - iOS simulator & web:        http://localhost:4000
 * - Android emulator:           http://10.0.2.2:4000
 * - Physical phone (Expo Go):   http://<your-laptop-LAN-IP>:4000
 *
 * Override via app config / .env: EXPO_PUBLIC_API_URL
 */
const DEFAULT_URL =
  Platform.OS === "android" ? "http://10.0.2.2:4000" : "http://localhost:4000";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_URL;

/** When true, the app falls back to seeded local data if the backend is down. */
export const DEMO_MODE =
  (process.env.EXPO_PUBLIC_DEMO_MODE ?? "true") === "true";
