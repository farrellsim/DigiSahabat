import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: text("display_name").notNull(),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number").unique(),
  preferredLanguage: text("preferred_language").default("en"),
  avatarUrl: text("avatar_url"),
  pinHash: text("pin_hash").notNull(),
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  streakCount: integer("streak_count").default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").default("beginner"),
  estimatedMinutes: integer("estimated_minutes").default(5),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  audioText: text("audio_text"),
  imageUrl: text("image_url"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: uuid("id").primaryKey().defaultRandom(),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizQuestions = pgTable("quiz_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  quizId: uuid("quiz_id").references(() => quizzes.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctOptionId: text("correct_option_id").notNull(),
  explanation: text("explanation").notNull(),
  sortOrder: integer("sort_order").default(0),
});

export const userProgress = pgTable("user_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  moduleId: uuid("module_id").references(() => modules.id, { onDelete: "cascade" }),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  status: text("status").default("not_started"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url"),
  xpReward: integer("xp_reward").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    badgeId: uuid("badge_id").references(() => badges.id, { onDelete: "cascade" }),
    earnedAt: timestamp("earned_at").defaultNow(),
  },
  (table) => ({
    userBadgeUnique: uniqueIndex("user_badges_user_id_badge_id_unique").on(
      table.userId,
      table.badgeId,
    ),
  }),
);

export const friendships = pgTable(
  "friendships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requesterId: uuid("requester_id").references(() => users.id, { onDelete: "cascade" }),
    receiverId: uuid("receiver_id").references(() => users.id, { onDelete: "cascade" }),
    status: text("status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    friendshipUnique: uniqueIndex("friendships_requester_id_receiver_id_unique").on(
      table.requesterId,
      table.receiverId,
    ),
  }),
);

export const aiChatMessages = pgTable("ai_chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
