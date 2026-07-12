import type { Env } from "../../lib/env";
import { getUserIdFromRequest } from "../../lib/session";
import { issueEmailVerificationCode } from "../../lib/email-verification";

// POST /api/auth/resend-verification
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const user = await env.PORTAL_DB.prepare(
    "SELECT email, email_verified FROM users WHERE id = ?",
  )
    .bind(userId)
    .first<{ email: string; email_verified: number }>();

  if (!user) return new Response("Not found", { status: 404 });
  if (user.email_verified) return Response.json({ ok: true, alreadyVerified: true });

  await issueEmailVerificationCode(env, userId, user.email);

  return Response.json({ ok: true });
};
