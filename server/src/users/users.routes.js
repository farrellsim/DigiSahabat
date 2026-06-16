import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../db/schema.js";
import { publicUser } from "../utils/responses.js";

const updateMeSchema = z.object({
  displayName: z.string().min(1).optional(),
  preferredLanguage: z.string().min(2).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

const usernameSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
});

const phoneSchema = z.object({
  phoneNumber: z.string().min(3).nullable(),
});

export async function registerUserRoutes(app) {
  app.get("/users/me", { preHandler: app.authenticate }, async (request) => ({
    user: publicUser(request.user),
  }));

  app.patch("/users/me", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = updateMeSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const [user] = await app.db
      .update(users)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(users.id, request.user.id))
      .returning();

    return { user: publicUser(user) };
  });

  app.patch("/users/me/username", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = usernameSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const [existing] = await app.db
      .select()
      .from(users)
      .where(eq(users.username, parsed.data.username.toLowerCase()))
      .limit(1);
    if (existing && existing.id !== request.user.id) {
      return reply.code(409).send({ error: "Username already exists" });
    }

    const [user] = await app.db
      .update(users)
      .set({ username: parsed.data.username.toLowerCase(), updatedAt: new Date() })
      .where(eq(users.id, request.user.id))
      .returning();

    return { user: publicUser(user) };
  });

  app.patch("/users/me/phone", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = phoneSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const [user] = await app.db
      .update(users)
      .set({ phoneNumber: parsed.data.phoneNumber, updatedAt: new Date() })
      .where(eq(users.id, request.user.id))
      .returning();

    return { user: publicUser(user) };
  });
}
