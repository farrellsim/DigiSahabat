import { eq } from "drizzle-orm";
import { badges, userBadges } from "../db/schema.js";

export async function registerBadgeRoutes(app) {
  app.get("/badges", async () => ({
    badges: await app.db.select().from(badges),
  }));

  app.get("/badges/me", { preHandler: app.authenticate }, async (request) => ({
    badges: await app.db
      .select({
        id: badges.id,
        code: badges.code,
        name: badges.name,
        description: badges.description,
        iconUrl: badges.iconUrl,
        xpReward: badges.xpReward,
        earnedAt: userBadges.earnedAt,
      })
      .from(userBadges)
      .innerJoin(badges, eq(userBadges.badgeId, badges.id))
      .where(eq(userBadges.userId, request.user.id)),
  }));
}
