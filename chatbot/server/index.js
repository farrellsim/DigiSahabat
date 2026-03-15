import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
import "dotenv/config";
import express from "express";
import fs from "fs";
import multer from "multer";
import OpenAI from "openai";

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json({ limit: "10mb" }));

const PORT = Number(process.env.PORT) || 4000;

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is missing. Put it in server/.env");
}

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

// ✅ Native Gemini client for audio transcription
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Multer for handling audio file uploads
const upload = multer({ dest: "uploads/" });

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// ✅ NEW: Transcribe audio endpoint
app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    console.log("📁 File received:", req.file);

    const audioData = fs.readFileSync(req.file.path);
    const base64Audio = audioData.toString("base64");

    console.log("🎵 Audio size (bytes):", audioData.length);

    fs.unlinkSync(req.file.path);

    if (audioData.length < 1000) {
      console.warn("⚠️ Audio file too small");
      return res.status(400).json({ error: "Audio too short" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Try multiple mimeTypes
    const mimeTypes = ["audio/mp4", "audio/x-m4a", "audio/m4a", "audio/mpeg"];
    let transcript = "";

    for (const mimeType of mimeTypes) {
      try {
        console.log(`🔄 Trying mimeType: ${mimeType}`);
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
        transcript = result.response.text().trim();
        if (transcript) {
          console.log(`✅ Success with mimeType: ${mimeType}`);
          console.log("📝 Transcript:", transcript);
          break;
        }
      } catch (err) {
        console.log(`❌ Failed with mimeType: ${mimeType}`, err.message);
      }
    }

    if (!transcript) {
      return res.status(400).json({ error: "Empty transcript" });
    }

    res.json({ transcript });
  } catch (e) {
    console.error("Transcription error:", e);
    res.status(500).json({ error: "Transcription failed" });
  }
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "messages must be a non-empty array" });
    }

    const cleaned = messages
      .filter(
        (m) => m && typeof m.content === "string" && typeof m.role === "string",
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const completion = await client.chat.completions.create(
      {
        model: "gemini-2.5-flash",
        messages: fullMessages,
        temperature: 0.7,
        max_completion_tokens: 500,
      },
      { signal: controller.signal },
    );

    clearTimeout(timeout);

    let reply = completion?.choices?.[0]?.message?.content;

    if (!reply) {
      console.log(
        "⚠️ Empty reply. Full response:",
        JSON.stringify(completion, null, 2),
      );
      reply = "Sorry, I couldn't generate a reply.";
    }

    res.json({ reply });
  } catch (e) {
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
    `✅ Listening on 0.0.0.0:${PORT} (phone can access via laptop IP)`,
  );
});
