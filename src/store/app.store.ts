import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  authApi,
  badgesApi,
  contentApi,
  friendsApi,
  progressApi,
  type ServerModule,
} from "../services/backend";
import { setTokenGetter } from "../services/client";
import { MODULES } from "../data/modules";

export type Badge = {
  code: string;
  name: string;
  description: string;
  xpReward: number;
  earnedAt: string;
};

export type Friend = {
  username: string;
  displayName: string;
  xp: number;
  status: "pending" | "accepted";
  /** true when the request was sent TO us (we can accept it). */
  incoming?: boolean;
};

type AppState = {
  // session
  token: string | null;
  userId: string | null;
  online: boolean; // last backend call succeeded

  // profile
  displayName: string;
  username: string;
  xp: number;
  level: number;
  streak: number;

  // progress / rewards
  completedLessons: string[];
  completedModules: string[]; // static module ids (e.g. "tech-devices")
  badges: Badge[];
  friends: Friend[];

  // backend module list (UUIDs) for id mapping
  serverModules: ServerModule[];

  // ── auth ───────────────────────────────────────────────────────────────
  loginWithPin: (identifier: string, pin: string) => Promise<void>;
  signupWithPin: (input: {
    displayName: string;
    username: string;
    pin: string;
    confirmPin: string;
    phoneNumber?: string;
  }) => Promise<void>;
  loginAsGuest: () => void;
  hydrate: () => Promise<void>;
  logout: () => Promise<void>;

  // ── progress ───────────────────────────────────────────────────────────
  completeLesson: (lessonId: string) => void;
  completeModule: (staticModuleId: string) => Promise<{ leveledBadge: boolean }>;

  // ── social ─────────────────────────────────────────────────────────────
  addFriend: (username: string) => Promise<boolean>;
  acceptFriend: (username: string) => Promise<void>;

  reset: () => void;
};

const KNOWN_USERS: Record<string, { displayName: string; xp: number }> = {
  pakdin: { displayName: "Pak Din", xp: 95 },
  siti01: { displayName: "Siti", xp: 80 },
  uncleman: { displayName: "Uncle Man", xp: 60 },
};

const DEFAULT_FRIENDS: Friend[] = [
  { username: "pakdin", displayName: "Pak Din", xp: 95, status: "accepted" },
  { username: "siti01", displayName: "Siti", xp: 80, status: "accepted" },
  { username: "uncleman", displayName: "Uncle Man", xp: 60, status: "accepted" },
];

const GUEST_STATE = {
  displayName: "Aunty Lela",
  username: "auntylela",
  xp: 70,
  level: 2,
  streak: 3,
  completedLessons: [] as string[],
  completedModules: [] as string[],
  badges: [] as Badge[],
  friends: DEFAULT_FRIENDS,
  serverModules: [] as ServerModule[],
};

const INITIAL_STATE = {
  token: null as string | null,
  userId: null as string | null,
  online: false,
  ...GUEST_STATE,
};

/** Resolve a static module id (e.g. "tech-devices") to a backend module UUID. */
function resolveServerModuleId(
  staticModuleId: string,
  serverModules: ServerModule[]
): string | null {
  const staticMod = MODULES.find((m) => m.id === staticModuleId);
  if (!staticMod) return null;
  const match = serverModules.find((m) => m.title === staticMod.title);
  return match?.id ?? null;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      loginWithPin: async (identifier, pin) => {
        const { user, token } = await authApi.login(identifier.trim(), pin);
        set({
          token,
          userId: user.id,
          online: true,
          displayName: user.displayName,
          username: user.username,
          xp: user.xp,
          level: user.level,
          streak: user.streakCount,
        });
        await get().hydrate();
      },

      signupWithPin: async (input) => {
        const { user, token } = await authApi.signup({
          ...input,
          preferredLanguage: "en",
        });
        set({
          token,
          userId: user.id,
          online: true,
          displayName: user.displayName,
          username: user.username,
          xp: user.xp,
          level: user.level,
          streak: user.streakCount,
          // fresh account starts clean
          completedLessons: [],
          completedModules: [],
          badges: [],
          friends: [],
        });
        await get().hydrate();
      },

      loginAsGuest: () => {
        set({ token: null, userId: null, online: false, ...GUEST_STATE });
      },

      hydrate: async () => {
        const token = get().token;
        if (!token) return;
        try {
          const [{ user }, { badges }, friendsRes, { modules }] =
            await Promise.all([
              authApi.me(),
              badgesApi.mine(),
              friendsApi.list(),
              contentApi.modules(),
            ]);

          // map friendships → flat friend list
          const meId = user.id;
          const friends: Friend[] = friendsRes.friendships.map((f) => {
            const otherId = f.requesterId === meId ? f.receiverId : f.requesterId;
            const other = friendsRes.users.find((u) => u.id === otherId);
            return {
              username: other?.username ?? "unknown",
              displayName: other?.displayName ?? "Unknown",
              xp: other?.xp ?? 0,
              status: f.status,
              incoming: f.status === "pending" && f.receiverId === meId,
            };
          });

          set({
            online: true,
            displayName: user.displayName,
            username: user.username,
            xp: user.xp,
            level: user.level,
            streak: user.streakCount,
            badges: badges.map((b) => ({
              code: b.code,
              name: b.name,
              description: b.description,
              xpReward: b.xpReward,
              earnedAt: b.earnedAt,
            })),
            friends,
            serverModules: modules,
          });
        } catch {
          // backend unreachable — keep local cached data (demo fallback)
          set({ online: false });
        }
      },

      logout: async () => {
        set({ ...INITIAL_STATE });
      },

      completeLesson: (lessonId) => {
        const { completedLessons } = get();
        if (!completedLessons.includes(lessonId)) {
          set({ completedLessons: [...completedLessons, lessonId] });
        }
      },

      completeModule: async (staticModuleId) => {
        const state = get();

        // mark complete locally (instant UI)
        if (!state.completedModules.includes(staticModuleId)) {
          set({ completedModules: [...state.completedModules, staticModuleId] });
        }

        const staticMod = MODULES.find((m) => m.id === staticModuleId);

        // try backend (authoritative XP + badge + leaderboard)
        if (state.token) {
          const serverId = resolveServerModuleId(
            staticModuleId,
            state.serverModules
          );
          if (serverId) {
            try {
              await progressApi.moduleComplete(serverId);
              const [{ user }, { badges }] = await Promise.all([
                authApi.me(),
                badgesApi.mine(),
              ]);
              set({
                online: true,
                xp: user.xp,
                level: user.level,
                badges: badges.map((b) => ({
                  code: b.code,
                  name: b.name,
                  description: b.description,
                  xpReward: b.xpReward,
                  earnedAt: b.earnedAt,
                })),
              });
              return { leveledBadge: true };
            } catch {
              set({ online: false });
            }
          }
        }

        // fallback: local XP + badge award
        if (staticMod) {
          const already = state.badges.some((b) => b.code === staticMod.badgeCode);
          if (!already) {
            const newXP = state.xp + staticMod.xpReward;
            set({
              xp: newXP,
              level: Math.floor(newXP / 100) + 1,
              badges: [
                ...state.badges,
                {
                  code: staticMod.badgeCode,
                  name: staticMod.badgeName,
                  description: staticMod.badgeDescription,
                  xpReward: staticMod.xpReward,
                  earnedAt: new Date().toISOString(),
                },
              ],
            });
          }
        }
        return { leveledBadge: false };
      },

      addFriend: async (username) => {
        const lower = username.trim().toLowerCase();
        const state = get();
        if (state.friends.find((f) => f.username === lower)) return false;

        if (state.token) {
          try {
            await friendsApi.request(lower);
            await get().hydrate();
            return true;
          } catch {
            set({ online: false });
            return false;
          }
        }

        // fallback: local pending friend
        const known = KNOWN_USERS[lower];
        set({
          friends: [
            ...state.friends,
            {
              username: lower,
              displayName: known?.displayName ?? username,
              xp: known?.xp ?? 0,
              status: "pending",
            },
          ],
        });
        return true;
      },

      acceptFriend: async (username) => {
        const state = get();
        if (state.token) {
          try {
            await friendsApi.accept(username);
            await get().hydrate();
            return;
          } catch {
            set({ online: false });
          }
        }
        set({
          friends: state.friends.map((f) =>
            f.username === username ? { ...f, status: "accepted" } : f
          ),
        });
      },

      reset: () => set(INITIAL_STATE),
    }),
    {
      name: "digisahabat-app-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// keep the API client's token in sync with the store
setTokenGetter(() => useAppStore.getState().token);
