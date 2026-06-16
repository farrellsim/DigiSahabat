import { API_URL } from "../config";

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, body: any, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.status = status;
    this.body = body;
  }
}

/** Returns the current bearer token, or null. Set by the auth store on login. */
let tokenGetter: () => string | null = () => null;
export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

type Options = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: any;
  auth?: boolean;
  timeoutMs?: number;
};

/**
 * Thin fetch wrapper: injects the bearer token, JSON-encodes the body,
 * applies a timeout, and throws ApiError on non-2xx responses.
 */
export async function apiFetch<T = any>(
  path: string,
  { method = "GET", body, auth = false, timeoutMs = 12000 }: Options = {}
): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenGetter();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    const json = text ? safeParse(text) : null;

    if (!res.ok) {
      throw new ApiError(res.status, json, json?.error?.message ?? res.statusText);
    }
    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** True if the backend health endpoint responds. Used to decide demo fallback. */
export async function isBackendReachable(): Promise<boolean> {
  try {
    await apiFetch("/health", { timeoutMs: 4000 });
    return true;
  } catch {
    return false;
  }
}
