import { and, eq } from "drizzle-orm";
import { hashPin } from "../auth/pin.service.js";
import { db, queryClient } from "./client.js";
import {
  badges,
  friendships,
  lessons,
  modules,
  quizQuestions,
  quizzes,
  userBadges,
  users,
} from "./schema.js";

async function findUser(username) {
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return user;
}

async function upsertUser({ displayName, username, pin = "123456", xp = 0, level = 1 }) {
  const existing = await findUser(username);
  const values = {
    displayName,
    username,
    preferredLanguage: "en",
    xp,
    level,
    pinHash: await hashPin(pin),
    updatedAt: new Date(),
  };

  if (existing) {
    const [user] = await db
      .update(users)
      .set(values)
      .where(eq(users.id, existing.id))
      .returning();
    return user;
  }

  const [user] = await db.insert(users).values(values).returning();
  return user;
}

async function seed() {
  const auntyLela = await upsertUser({
    displayName: "Aunty Lela",
    username: "auntylela",
    pin: "123456",
    xp: 70,
    level: 2,
  });

  const demoFriends = await Promise.all([
    upsertUser({ displayName: "Pak Din", username: "pakdin", xp: 95, level: 2 }),
    upsertUser({ displayName: "Siti", username: "siti01", xp: 80, level: 2 }),
    upsertUser({ displayName: "Uncle Man", username: "uncleman", xp: 60, level: 1 }),
  ]);

  for (const friend of demoFriends) {
    await db
      .insert(friendships)
      .values({
        requesterId: auntyLela.id,
        receiverId: friend.id,
        status: "accepted",
        updatedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  let [module] = await db
    .select()
    .from(modules)
    .where(eq(modules.title, "Learning Tech Devices"))
    .limit(1);

  if (!module) {
    [module] = await db
      .insert(modules)
      .values({
        title: "Learning Tech Devices",
        description: "Learn about common technology devices and how they are used in daily life.",
        difficulty: "Beginner",
        estimatedMinutes: 5,
        sortOrder: 1,
      })
      .returning();
  }

  const lessonData = [
    {
      title: "What is technology?",
      body: "Technology is a tool that helps us do things faster or easier. A phone helps us call family. A printer helps us print documents. The internet helps us find information.",
      audioText:
        "Technology means tools that help us in daily life. Some examples are phones, printers, and the internet.",
      sortOrder: 1,
    },
    {
      title: "What is a printer?",
      body: "A printer is a device that prints words or pictures onto paper. People use printers for forms, school work, letters, and documents. Paper goes into the paper tray.",
      audioText:
        "A printer puts words or pictures on paper. The paper usually goes in the paper tray.",
      sortOrder: 2,
    },
    {
      title: "Safe device use",
      body: "Do not press unknown links. Do not share your PIN. Ask someone you trust if you are unsure.",
      audioText:
        "Stay safe. Do not press unknown links. Do not share your PIN. Ask someone you trust.",
      sortOrder: 3,
    },
  ];

  for (const lesson of lessonData) {
    const [existing] = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.moduleId, module.id), eq(lessons.title, lesson.title)))
      .limit(1);
    if (!existing) await db.insert(lessons).values({ ...lesson, moduleId: module.id });
  }

  let [quiz] = await db.select().from(quizzes).where(eq(quizzes.moduleId, module.id)).limit(1);
  if (!quiz) {
    [quiz] = await db
      .insert(quizzes)
      .values({ moduleId: module.id, title: "Learning Tech Devices Quiz" })
      .returning();
  }

  const questionData = [
    {
      question: "What is the main function of a printer?",
      options: [
        { id: "A", text: "Make phone calls" },
        { id: "B", text: "Print documents" },
        { id: "C", text: "Play music" },
      ],
      correctOptionId: "B",
      explanation: "A printer is used to print documents and pictures.",
      sortOrder: 1,
    },
    {
      question: "Where does the paper go in a printer?",
      options: [
        { id: "A", text: "On top" },
        { id: "B", text: "In the paper tray" },
        { id: "C", text: "Behind the printer" },
      ],
      correctOptionId: "B",
      explanation: "Paper usually goes in the paper tray.",
      sortOrder: 2,
    },
    {
      question: "What should you do if you receive a strange message asking for your PIN?",
      options: [
        { id: "A", text: "Share your PIN quickly" },
        { id: "B", text: "Ignore it or ask someone you trust" },
        { id: "C", text: "Send it to more people" },
      ],
      correctOptionId: "B",
      explanation: "Never share your PIN. Ask someone you trust if you are unsure.",
      sortOrder: 3,
    },
  ];

  for (const question of questionData) {
    const [existing] = await db
      .select()
      .from(quizQuestions)
      .where(and(eq(quizQuestions.quizId, quiz.id), eq(quizQuestions.question, question.question)))
      .limit(1);
    if (!existing) await db.insert(quizQuestions).values({ ...question, quizId: quiz.id });
  }

  let [badge] = await db.select().from(badges).where(eq(badges.code, "tech_explorer")).limit(1);
  if (!badge) {
    [badge] = await db
      .insert(badges)
      .values({
        code: "tech_explorer",
        name: "Tech Explorer",
        description: "Completed the Learning Tech Devices module.",
        xpReward: 50,
      })
      .returning();
  }

  await db
    .insert(userBadges)
    .values({ userId: auntyLela.id, badgeId: badge.id })
    .onConflictDoNothing();

  console.log("Seed complete: auntylela / PIN 123456, demo module, badge, and friends.");
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await queryClient.end();
  });
