import crypto from "node:crypto";
import { env } from "../env.js";

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", env.BETTER_AUTH_SECRET).update(value).digest("base64url");
}

export function createAuthToken(userId) {
  const payload = {
    sub: userId,
    exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
  };
  const body = base64UrlEncode(payload);
  return `${body}.${sign(body)}`;
}

export function verifyAuthToken(token) {
  const [body, signature] = String(token).split(".");
  if (!body || !signature || sign(body) !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
