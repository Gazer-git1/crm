import type { Env } from "../../lib/env";
import { createSession } from "../../lib/session";
import { verifyPassword } from "../../lib/password";

// POST /api/auth/login   { "email": "...", "password": "..." }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  if (!email?.trim() || !password) {
    return new Response("Email and password are required", { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await env.PORTAL_DB.prepare(
    "SELECT id, full_name, password_hash FROM users WHERE email = ?",
  )
    .bind(normalizedEmail)
    .first<{ id: string; full_name: string; password_hash: string | null }>();

  // Same generic error whether the email doesn't exist or the password is wrong,
  // and whether the account has no password set (e.g. Google-only) — avoids
  // leaking which emails are registered or how they signed up.
  const genericError = () => new Response("Invalid email or password", { status: 401 });

  if (!user || !user.password_hash) return genericError();

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return genericError();

  const cookie = await createSession(env, user.id);

  return Response.json(
    { id: user.id, fullName: user.full_name, email: normalizedEmail },
    { headers: { "Set-Cookie": cookie } },
  );
};
