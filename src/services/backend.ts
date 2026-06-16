import { apiFetch } from "./client";

/** Shapes returned by the backend (subset of fields we use). */
export type ServerUser = {
  id: string;
  displayName: string;
  username: string;
  phoneNumber: string | null;
  preferredLanguage: string;
  xp: number;
  level: number;
  streakCount: number;
};

export type ServerBadge = {
  id: string;
  code: string;
  name: string;
  description: string;
  xpReward: number;
  earnedAt: string;
};

export type ServerModule = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  estimatedMinutes: number;
};

export type ServerFriendship = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "pending" | "accepted";
};

export type LeaderboardEntry = {
  rank: number;
  user: ServerUser;
  xp: number;
  badgeCount: number;
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (identifier: string, pin: string) =>
    apiFetch<{ user: ServerUser; token: string }>("/auth/login-pin", {
      method: "POST",
      body: { identifier, pin },
    }),

  signup: (input: {
    displayName: string;
    username: string;
    pin: string;
    confirmPin: string;
    phoneNumber?: string;
    preferredLanguage?: string;
  }) =>
    apiFetch<{ user: ServerUser; token: string }>("/auth/signup-pin", {
      method: "POST",
      body: input,
    }),

  me: () => apiFetch<{ user: ServerUser }>("/auth/me", { auth: true }),
};

// ─── Content ─────────────────────────────────────────────────────────────────
export const contentApi = {
  modules: () => apiFetch<{ modules: ServerModule[] }>("/modules"),
};

// ─── Progress ────────────────────────────────────────────────────────────────
export const progressApi = {
  moduleComplete: (moduleId: string) =>
    apiFetch<{ earnedBadge: ServerBadge | null; ok: boolean }>(
      "/progress/module-complete",
      { method: "POST", body: { moduleId }, auth: true }
    ),
};

// ─── Badges ──────────────────────────────────────────────────────────────────
export const badgesApi = {
  mine: () => apiFetch<{ badges: ServerBadge[] }>("/badges/me", { auth: true }),
};

// ─── Friends ─────────────────────────────────────────────────────────────────
export const friendsApi = {
  list: () =>
    apiFetch<{ friendships: ServerFriendship[]; users: ServerUser[] }>(
      "/friends",
      { auth: true }
    ),

  request: (username: string) =>
    apiFetch<{ friendship: ServerFriendship | null; receiver: ServerUser }>(
      "/friends/request",
      { method: "POST", body: { username }, auth: true }
    ),

  accept: (username: string) =>
    apiFetch<{ friendship: ServerFriendship }>("/friends/accept", {
      method: "POST",
      body: { username },
      auth: true,
    }),
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const leaderboardApi = {
  weekly: () =>
    apiFetch<{ leaderboard: LeaderboardEntry[] }>("/leaderboard/weekly"),
};
