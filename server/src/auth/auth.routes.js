import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { users } from "../db/schema.js";
import { publicUser } from "../utils/responses.js";
import { assertSixDigitPin, hashPin, verifyPin } from "./pin.service.js";
import { createAuthToken } from "./token.service.js";

const signupSchema = z
  .object({
    displayName: z.string().min(1),
    username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
    phoneNumber: z.string().optional().nullable(),
    pin: z.string(),
    confirmPin: z.string(),
    preferredLanguage: z.string().default("en"),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PIN confirmation does not match",
    path: ["confirmPin"],
  });

const loginSchema = z.object({
  identifier: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  pin: z.string(),
});

const changePinSchema = z.object({
  currentPin: z.string(),
  newPin: z.string(),
});

export async function registerAuthRoutes(app) {
  app.post("/auth/signup-pin", async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    if (!assertSixDigitPin(parsed.data.pin)) {
      return reply.code(400).send({ error: "PIN must be exactly 6 digits" });
    }

    const existing = await app.db
      .select()
      .from(users)
      .where(eq(users.username, parsed.data.username.toLowerCase()))
      .limit(1);
    if (existing.length) return reply.code(409).send({ error: "Username already exists" });

    const [user] = await app.db
      .insert(users)
      .values({
        displayName: parsed.data.displayName,
        username: parsed.data.username.toLowerCase(),
        phoneNumber: parsed.data.phoneNumber || null,
        preferredLanguage: parsed.data.preferredLanguage,
        pinHash: await hashPin(parsed.data.pin),
        lastActiveAt: new Date(),
      })
      .returning();

    return reply.code(201).send({ user: publicUser(user), token: createAuthToken(user.id) });
  });

  app.post("/auth/login-pin", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    if (!assertSixDigitPin(parsed.data.pin)) {
      return reply.code(400).send({ error: "PIN must be exactly 6 digits" });
    }

    const identifier =
      parsed.data.identifier || parsed.data.username || parsed.data.phoneNumber || "";
    const [user] = await app.db
      .select()
      .from(users)
      .where(or(eq(users.username, identifier.toLowerCase()), eq(users.phoneNumber, identifier)))
      .limit(1);

    if (!user || !(await verifyPin(user.pinHash, parsed.data.pin))) {
      return reply.code(401).send({ error: "Invalid username/phone or PIN" });
    }

    const [updatedUser] = await app.db
      .update(users)
      .set({ lastActiveAt: new Date(), updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();

    return { user: publicUser(updatedUser), token: createAuthToken(user.id) };
  });

  app.post("/auth/logout", { preHandler: app.authenticate }, async () => ({ ok: true }));

  app.get("/auth/me", { preHandler: app.authenticate }, async (request) => ({
    user: publicUser(request.user),
  }));

  app.post("/auth/change-pin", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = changePinSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });
    if (!assertSixDigitPin(parsed.data.currentPin) || !assertSixDigitPin(parsed.data.newPin)) {
      return reply.code(400).send({ error: "PIN must be exactly 6 digits" });
    }
    if (!(await verifyPin(request.user.pinHash, parsed.data.currentPin))) {
      return reply.code(401).send({ error: "Current PIN is incorrect" });
    }

    await app.db
      .update(users)
      .set({ pinHash: await hashPin(parsed.data.newPin), updatedAt: new Date() })
      .where(and(eq(users.id, request.user.id), eq(users.pinHash, request.user.pinHash)));

    return { ok: true };
  });
}
