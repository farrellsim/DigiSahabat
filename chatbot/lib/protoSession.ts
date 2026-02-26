import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "proto_session_v1";

export type ProtoSession = {
  isAuthed: boolean;
  username?: string;
  phone?: string;
  language?: "en" | "ms" | "zh";
  textSize?: "Small" | "Medium" | "Large";
  notifications?: boolean;
  voice?: boolean;
};

const DEFAULTS: ProtoSession = {
  isAuthed: false,
  language: "en",
  textSize: "Medium",
  notifications: true,
  voice: false,
};

export async function getSession(): Promise<ProtoSession> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as ProtoSession) };
  } catch {
    return DEFAULTS;
  }
}

export async function setSession(patch: Partial<ProtoSession>): Promise<void> {
  const current = await getSession();
  const next = { ...current, ...patch };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(DEFAULTS));
}
