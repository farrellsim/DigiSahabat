import { eq } from "drizzle-orm";
import { z } from "zod";
import { badges, modules, userBadges, userProgress, users } from "../db/schema.js";

const lessonCompleteSchema = z.object({
  moduleId: z.string().uuid(),
  lessonId: z.string().uuid(),
});

const moduleCompleteSchema = z.object({
  moduleId: z.string().uuid(),
});

export async function registerProgressRoutes(app) {
  app.get("/progress/me", { preHandler: app.authenticate }, async (request) => ({
    progress: await app.db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, request.user.id)),
  }));

  app.post(
    "/progress/lesson-complete",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const parsed = lessonCompleteSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

      const [progress] = await app.db
        .insert(userProgress)
        .values({
          userId: request.user.id,
          moduleId: parsed.data.moduleId,
          lessonId: parsed.data.lessonId,
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();

      return { progress, ok: true };
    },
  );

  app.post(
    "/progress/module-complete",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const parsed = moduleCompleteSchema.safeParse(request.body);
      if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

      const [module] = await app.db
        .select()
        .from(modules)
        .where(eq(modules.id, parsed.data.moduleId))
        .limit(1);
      if (!module) return reply.code(404).send({ error: "Module not found" });

      const [progress] = await app.db
        .insert(userProgress)
        .values({
          userId: request.user.id,
          moduleId: parsed.data.moduleId,
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning();

      const [badge] = await app.db
        .select()
        .from(badges)
        .where(eq(badges.code, "tech_explorer"))
        .limit(1);

      let earnedBadge = null;
      if (badge) {
        const [newBadge] = await app.db
          .insert(userBadges)
          .values({ userId: request.user.id, badgeId: badge.id })
          .onConflictDoNothing()
          .returning();
        if (newBadge) {
          await app.db
            .update(users)
            .set({
              xp: (request.user.xp || 0) + (badge.xpReward || 0),
              level: Math.max(request.user.level || 1, 2),
              updatedAt: new Date(),
            })
            .where(eq(users.id, request.user.id));
          earnedBadge = badge;
        }
      }

      return { progress, earnedBadge, ok: true };
    },
  );
}
