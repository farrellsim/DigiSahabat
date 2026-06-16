import { normalizeMessages, createGeminiReply, saveChatTurn, transcribeAudio } from "./ai.service.js";

async function optionalUser(app, request) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!token) return null;

  try {
    await app.authenticate(request, {
      code() {
        return this;
      },
      send() {
        return this;
      },
    });
    return request.user;
  } catch {
    return null;
  }
}

async function handleChat(app, request, reply) {
  const messages = normalizeMessages(request.body);
  if (!messages.length) {
    return reply.code(400).send({ error: "Provide message or messages" });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const assistantMessage = await createGeminiReply(app, messages, controller.signal);
    clearTimeout(timeout);

    const user = await optionalUser(app, request);
    const latestUserMessage = [...messages].reverse().find((message) => message.role === "user");
    await saveChatTurn(app, user?.id, latestUserMessage?.content || "", assistantMessage);

    return { reply: assistantMessage, message: assistantMessage };
  } catch (error) {
    clearTimeout(timeout);
    if (error?.name === "AbortError") {
      return reply.code(504).send({ error: "AI request timed out" });
    }
    request.log.error(error);
    return reply.code(500).send({ error: "AI request failed" });
  }
}

async function handleTranscribe(app, request, reply) {
  const file = await request.file();
  if (!file) return reply.code(400).send({ error: "No audio file provided" });

  const buffer = await file.toBuffer();
  if (buffer.length < 1000) {
    return reply.code(400).send({ error: "Audio too short" });
  }

  const transcript = await transcribeAudio(app, buffer);
  if (!transcript) return reply.code(400).send({ error: "Empty transcript" });

  return { transcript };
}

export async function registerAiRoutes(app) {
  app.post("/chat", (request, reply) => handleChat(app, request, reply));
  app.post("/ai/chat", (request, reply) => handleChat(app, request, reply));

  app.post("/transcribe", (request, reply) => handleTranscribe(app, request, reply));
  app.post("/ai/voice-transcribe", (request, reply) => handleTranscribe(app, request, reply));
}
