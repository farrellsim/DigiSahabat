import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import Fastify from "fastify";
import OpenAI from "openai";
import { registerAiRoutes } from "./ai/ai.routes.js";
import { registerAuthRoutes } from "./auth/auth.routes.js";
import { verifyAuthToken } from "./auth/token.service.js";
import { registerBadgeRoutes } from "./badges/badges.routes.js";
import { db } from "./db/client.js";
import { users } from "./db/schema.js";
import { env } from "./env.js";
import { registerFriendRoutes } from "./friends/friends.routes.js";
import { registerLeaderboardRoutes } from "./leaderboard/leaderboard.routes.js";
import { registerModuleRoutes } from "./modules/modules.routes.js";
import { registerProgressRoutes } from "./progress/progress.routes.js";
import { registerQuizRoutes } from "./quiz/quiz.routes.js";
import { registerUserRoutes } from "./users/users.routes.js";
import { eq } from "drizzle-orm";

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "test" ? "silent" : "info",
    },
  });

  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  app.decorate("db", db);
  app.decorate(
    "geminiChatClient",
    new OpenAI({
      apiKey: env.GEMINI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    }),
  );
  app.decorate(
    "geminiAudioClient",
    env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null,
  );

  app.decorate("authenticate", async (request, reply) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : null;

    if (!token) {
      return reply.code(401).send({ error: "Missing bearer token" });
    }

    const payload = verifyAuthToken(token);
    if (!payload) {
      return reply.code(401).send({ error: "Invalid or expired token" });
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user) {
      return reply.code(401).send({ error: "User not found" });
    }

    request.user = user;
    request.token = token;
  });

  app.get("/health", async () => ({ ok: true }));

  await registerAuthRoutes(app);
  await registerUserRoutes(app);
  await registerModuleRoutes(app);
  await registerQuizRoutes(app);
  await registerProgressRoutes(app);
  await registerBadgeRoutes(app);
  await registerFriendRoutes(app);
  await registerLeaderboardRoutes(app);
  await registerAiRoutes(app);

  return app;
}
