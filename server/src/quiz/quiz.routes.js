import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { badges, quizQuestions, quizzes, userBadges, users } from "../db/schema.js";
import { optionSafeQuestion } from "../utils/responses.js";

const submitSchema = z.object({
  answers: z.record(z.string(), z.string()).optional(),
  questionId: z.string().uuid().optional(),
  selectedOptionId: z.string().optional(),
});

export async function registerQuizRoutes(app) {
  app.get("/modules/:moduleId/quiz", async (request, reply) => {
    const [quiz] = await app.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.moduleId, request.params.moduleId))
      .limit(1);
    if (!quiz) return reply.code(404).send({ error: "Quiz not found" });

    const questions = await app.db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id))
      .orderBy(asc(quizQuestions.sortOrder));

    return { quiz, questions: questions.map(optionSafeQuestion) };
  });

  app.post("/quiz/:quizId/submit", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = submitSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const questions = await app.db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, request.params.quizId))
      .orderBy(asc(quizQuestions.sortOrder));

    if (!questions.length) return reply.code(404).send({ error: "Quiz not found" });

    const answers =
      parsed.data.answers ||
      (parsed.data.questionId && parsed.data.selectedOptionId
        ? { [parsed.data.questionId]: parsed.data.selectedOptionId }
        : {});

    const results = questions.map((question) => {
      const selectedOptionId = answers[question.id];
      const correct = selectedOptionId === question.correctOptionId;
      return {
        questionId: question.id,
        selectedOptionId,
        correctOptionId: question.correctOptionId,
        correct,
        explanation: question.explanation,
      };
    });
    const correctCount = results.filter((result) => result.correct).length;

    let earnedBadge = null;
    if (correctCount === questions.length) {
      const [badge] = await app.db
        .select()
        .from(badges)
        .where(eq(badges.code, "tech_explorer"))
        .limit(1);
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
    }

    return {
      score: correctCount,
      total: questions.length,
      passed: correctCount === questions.length,
      results,
      earnedBadge,
    };
  });
}
