import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// ✅ Allow your phone (Expo) to call this backend
app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT) || 4000;

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is missing. Put it in server/.env");
}

// ✅ Gemini OpenAI-compatible endpoint TEMPCHANGE
// const client = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "messages must be a non-empty array" });
    }

    // ✅ Enforce correct message shape
    const cleaned = messages
      .filter(
        (m) => m && typeof m.content === "string" && typeof m.role === "string"
      )
      .map((m) => ({
        role: m.role === "assistant" || m.role === "user" ? m.role : "user",
        content: m.content.trim(),
      }))
      .filter((m) => m.content.length > 0);

    const fullMessages = [
      {
        role: "system",
        content:
          "You are DigiBuddy, an AI learning assistant. Be friendly, clear, and explain step-by-step. Use short paragraphs and bullet points when helpful.",
      },
      ...cleaned,
    ];

    // ✅ Timeout so your app doesn’t hang forever
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const completion = await client.chat.completions.create(
      {
        model: "gemini-2.5-flash",
        messages: fullMessages,
        temperature: 0.7,

        // ✅ Better behaviour across OpenAI-compatible servers:
        // some respect max_completion_tokens more reliably than max_tokens
        max_completion_tokens: 500,
      },
      { signal: controller.signal }
    );

    clearTimeout(timeout);

    // ✅ Safe extraction
    let reply = completion?.choices?.[0]?.message?.content;

    // If Gemini returns weird shapes, you’ll see it in logs
    if (!reply) {
      console.log(
        "⚠️ Empty reply. Full response:",
        JSON.stringify(completion, null, 2)
      );
      reply = "Sorry, I couldn’t generate a reply.";
    }

    res.json({ reply });
  } catch (e) {
    // Timeout / abort
    if (e?.name === "AbortError") {
      return res.status(504).json({ error: "AI request timed out" });
    }

    console.error("Server error:", e);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(
    `✅ Listening on 0.0.0.0:${PORT} (phone can access via laptop IP)`
  );
});
