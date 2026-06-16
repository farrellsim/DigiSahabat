import { desc, eq, or, sql } from "drizzle-orm";
import { friendships, userBadges, users } from "../db/schema.js";
import { publicUser } from "../utils/responses.js";

async function leaderboardRows(app, userIds = null) {
  const allUsers = await app.db.select().from(users).orderBy(desc(users.xp)).limit(50);
  const filtered = userIds ? allUsers.filter((user) => userIds.includes(user.id)) : allUsers;

  const rows = [];
  for (const [index, user] of filtered.entries()) {
    const [{ count }] = await app.db
      .select({ count: sql`count(*)::int` })
      .from(userBadges)
      .where(eq(userBadges.userId, user.id));
    rows.push({
      rank: index + 1,
      user: publicUser(user),
      xp: user.xp || 0,
      badgeCount: count,
    });
  }
  return rows;
}

export async function registerLeaderboardRoutes(app) {
  app.get("/leaderboard/weekly", async () => ({
    leaderboard: await leaderboardRows(app),
  }));

  app.get("/leaderboard/friends", { preHandler: app.authenticate }, async (request) => {
    const rows = await app.db
      .select()
      .from(friendships)
      .where(
        or(
          eq(friendships.requesterId, request.user.id),
          eq(friendships.receiverId, request.user.id),
        ),
      );
    const friendIds = rows
      .filter((row) => row.status === "accepted")
      .map((row) =>
        row.requesterId === request.user.id ? row.receiverId : row.requesterId,
      );
    return {
      leaderboard: await leaderboardRows(app, [request.user.id, ...friendIds]),
    };
  });
}
