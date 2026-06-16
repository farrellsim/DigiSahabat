import { and, eq, or } from "drizzle-orm";
import { z } from "zod";
import { friendships, users } from "../db/schema.js";
import { publicUser } from "../utils/responses.js";

const usernameBodySchema = z.object({
  username: z.string().min(1),
});

const friendshipIdBodySchema = z.object({
  friendshipId: z.string().uuid().optional(),
  username: z.string().min(1).optional(),
});

function friendRowsFor(userId) {
  return or(eq(friendships.requesterId, userId), eq(friendships.receiverId, userId));
}

export async function registerFriendRoutes(app) {
  app.get("/friends", { preHandler: app.authenticate }, async (request) => {
    const rows = await app.db
      .select()
      .from(friendships)
      .where(friendRowsFor(request.user.id));

    const userIds = [
      ...new Set(rows.flatMap((row) => [row.requesterId, row.receiverId]).filter(Boolean)),
    ].filter((id) => id !== request.user.id);

    const friendUsers = [];
    for (const id of userIds) {
      const [user] = await app.db.select().from(users).where(eq(users.id, id)).limit(1);
      if (user) friendUsers.push(publicUser(user));
    }

    return { friendships: rows, users: friendUsers };
  });

  app.post("/friends/request", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = usernameBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    const [receiver] = await app.db
      .select()
      .from(users)
      .where(eq(users.username, parsed.data.username.toLowerCase()))
      .limit(1);
    if (!receiver) return reply.code(404).send({ error: "User not found" });
    if (receiver.id === request.user.id) {
      return reply.code(400).send({ error: "You cannot add yourself as a friend" });
    }

    const [friendship] = await app.db
      .insert(friendships)
      .values({
        requesterId: request.user.id,
        receiverId: receiver.id,
        status: "pending",
        updatedAt: new Date(),
      })
      .onConflictDoNothing()
      .returning();

    return { friendship, receiver: publicUser(receiver) };
  });

  app.post("/friends/accept", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = friendshipIdBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    let friendshipId = parsed.data.friendshipId;
    if (!friendshipId && parsed.data.username) {
      const [requester] = await app.db
        .select()
        .from(users)
        .where(eq(users.username, parsed.data.username.toLowerCase()))
        .limit(1);
      const [friendship] = requester
        ? await app.db
            .select()
            .from(friendships)
            .where(
              and(
                eq(friendships.requesterId, requester.id),
                eq(friendships.receiverId, request.user.id),
              ),
            )
            .limit(1)
        : [];
      friendshipId = friendship?.id;
    }

    if (!friendshipId) return reply.code(400).send({ error: "friendshipId is required" });

    const [friendship] = await app.db
      .update(friendships)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(and(eq(friendships.id, friendshipId), eq(friendships.receiverId, request.user.id)))
      .returning();

    if (!friendship) return reply.code(404).send({ error: "Friend request not found" });
    return { friendship };
  });

  app.post("/friends/remove", { preHandler: app.authenticate }, async (request, reply) => {
    const parsed = friendshipIdBodySchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: parsed.error.flatten() });

    if (parsed.data.friendshipId) {
      await app.db
        .delete(friendships)
        .where(and(eq(friendships.id, parsed.data.friendshipId), friendRowsFor(request.user.id)));
      return { ok: true };
    }

    if (!parsed.data.username) return reply.code(400).send({ error: "username is required" });
    const [otherUser] = await app.db
      .select()
      .from(users)
      .where(eq(users.username, parsed.data.username.toLowerCase()))
      .limit(1);
    if (!otherUser) return reply.code(404).send({ error: "User not found" });

    await app.db
      .delete(friendships)
      .where(
        or(
          and(eq(friendships.requesterId, request.user.id), eq(friendships.receiverId, otherUser.id)),
          and(eq(friendships.requesterId, otherUser.id), eq(friendships.receiverId, request.user.id)),
        ),
      );
    return { ok: true };
  });
}
