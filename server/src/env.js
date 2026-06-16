import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .default("postgresql://postgres:postgres@localhost:5432/digisahabat"),
  BETTER_AUTH_SECRET: z.string().default("replace-this-with-random-secret"),
  BETTER_AUTH_URL: z.string().default("http://localhost:4000"),
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("qwen2.5:3b"),
  GEMINI_API_KEY: z.string().optional(),
});

export const env = envSchema.parse(process.env);
