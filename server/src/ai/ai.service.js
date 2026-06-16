import { aiChatMessages } from "../db/schema.js";
import { env } from "../env.js";
import { DIGIBUDDY_SYSTEM_PROMPT } from "./prompts.js";

export function normalizeMessages(body) {
  if (Array.isArray(body?.messages)) {
    return body.messages
      .filter((message) => typeof message?.content === "string")
      .map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: message.content.trim(),
      }))
      .filter((message) => message.content.length > 0);
  }

  if (typeof body?.message === "string" && body.message.trim()) {
    return [{ role: "user", content: body.message.trim() }];
  }

  return [];
}

export async function createGeminiReply(app, messages, signal) {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const completion = await app.geminiChatClient.chat.completions.create(
    {
      model: "gemini-2.5-flash",
      messages: [{ role: "system", content: DIGIBUDDY_SYSTEM_PROMPT }, ...messages],
      temperature: 0.7,
      max_completion_tokens: 500,
    },
    { signal },
  );

  return (
    completion?.choices?.[0]?.message?.content ||
    "Sorry, I could not answer that just now."
  );
}

export async function saveChatTurn(app, userId, userMessage, assistantMessage) {
  if (!userId) return;
  await app.db.insert(aiChatMessages).values([
    { userId, role: "user", content: userMessage },
    { userId, role: "assistant", content: assistantMessage },
  ]);
}

export async function transcribeAudio(app, fileBuffer) {
  if (!app.geminiAudioClient) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = app.geminiAudioClient.getGenerativeModel({
    model: "gemini-2.5-flash",
  });
  const base64Audio = fileBuffer.toString("base64");
  const mimeTypes = ["audio/mp4", "audio/x-m4a", "audio/m4a", "audio/mpeg", "audio/wav"];

  for (const mimeType of mimeTypes) {
    try {
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType,
            data: base64Audio,
          },
        },
        {
          text: "Transcribe exactly what is said in this audio. Return only the transcribed text, nothing else.",
        },
      ]);
      const transcript = result.response.text().trim();
      if (transcript) return transcript;
    } catch (error) {
      app.log.warn({ error: error.message, mimeType }, "Gemini transcription attempt failed");
    }
  }

  return "";
}
