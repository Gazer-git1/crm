import type { Env } from "../../lib/env";
import { createSession } from "../../lib/session";
import { hashPassword } from "../../lib/password";
import { issueEmailVerificationCode } from "../../lib/email-verification";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/signup   { "fullName": "...", "email": "...", "password": "..." }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { fullName, email, password } = (await request.json()) as {
    fullName?: string;
    email?: string;
    password?: string;
  };

  if (!fullName?.trim() || !email?.trim() || !password) {
    return new Response("fullName, email and password are required", { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return new Response("Invalid email address", { status: 400 });
  }
  if (password.length < 8) {
    return new Response("Password must be at least 8 characters", { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await env.PORTAL_DB.prepare("SELECT id FROM users WHERE email = ?")
    .bind(normalizedEmail)
    .first();
  if (existing) {
    return new Response("An account with this email already exists", { status: 409 });
  }

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  await env.PORTAL_DB.prepare(
    "INSERT INTO users (id, full_name, email, password_hash) VALUES (?, ?, ?, ?)",
  )
    .bind(userId, fullName.trim(), normalizedEmail, passwordHash)
    .run();

  const cookie = await createSession(env, userId);

  try {
    await issueEmailVerificationCode(env, userId, normalizedEmail);
  } catch (err) {
    // Don't block account creation if the email provider isn't configured yet
    // (e.g. RESEND_API_KEY missing in local/dev) — the user can request a new
    // code once it is, via /api/auth/resend-verification.
    console.error("Failed to send verification email", err);
  }

  return Response.json(
    { id: userId, fullName: fullName.trim(), email: normalizedEmail, emailVerified: false },
    { status: 201, headers: { "Set-Cookie": cookie } },
  );
};
