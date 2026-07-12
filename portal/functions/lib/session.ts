import type { Env } from "./env";

const SESSION_COOKIE = "ia_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function randomToken() {
  return crypto.randomUUID() + crypto.randomUUID();
}

async function hashToken(token: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(token));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSession(env: Env, userId: string) {
  const token = randomToken();
  const tokenHash = await hashToken(token, env.SESSION_SECRET);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  await env.PORTAL_DB.prepare(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
  )
    .bind(tokenHash, userId, expiresAt)
    .run();

  const cookie = [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ].join("; ");

  return cookie;
}

function getSessionToken(request: Request) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  return match?.split("=")[1] ?? null;
}

export async function getUserIdFromRequest(request: Request, env: Env) {
  const token = getSessionToken(request);
  if (!token) return null;

  const tokenHash = await hashToken(token, env.SESSION_SECRET);

  const row = await env.PORTAL_DB.prepare(
    "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')",
  )
    .bind(tokenHash)
    .first<{ user_id: string }>();

  return row?.user_id ?? null;
}

export async function destroySession(request: Request, env: Env) {
  const token = getSessionToken(request);
  if (token) {
    const tokenHash = await hashToken(token, env.SESSION_SECRET);
    await env.PORTAL_DB.prepare("DELETE FROM sessions WHERE id = ?").bind(tokenHash).run();
  }

  return [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ].join("; ");
}
