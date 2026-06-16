import { asc, eq } from "drizzle-orm";
import { lessons, modules } from "../db/schema.js";

export async function registerModuleRoutes(app) {
  app.get("/modules", async () => ({
    modules: await app.db
      .select()
      .from(modules)
      .where(eq(modules.isPublished, true))
      .orderBy(asc(modules.sortOrder), asc(modules.createdAt)),
  }));

  app.get("/modules/:moduleId", async (request, reply) => {
    const [module] = await app.db
      .select()
      .from(modules)
      .where(eq(modules.id, request.params.moduleId))
      .limit(1);
    if (!module) return reply.code(404).send({ error: "Module not found" });
    return { module };
  });

  app.get("/modules/:moduleId/lessons", async (request) => ({
    lessons: await app.db
      .select()
      .from(lessons)
      .where(eq(lessons.moduleId, request.params.moduleId))
      .orderBy(asc(lessons.sortOrder)),
  }));

  app.get("/lessons/:lessonId", async (request, reply) => {
    const [lesson] = await app.db
      .select()
      .from(lessons)
      .where(eq(lessons.id, request.params.lessonId))
      .limit(1);
    if (!lesson) return reply.code(404).send({ error: "Lesson not found" });
    return { lesson };
  });
}
