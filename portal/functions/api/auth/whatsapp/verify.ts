import type { Env } from "../../../lib/env";
import { getUserIdFromRequest } from "../../../lib/session";
import { hashOtp } from "../../../lib/otp";

// POST /api/auth/whatsapp/verify   { "phone": "+971501234567", "code": "123456" }
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { phone, code } = (await request.json()) as { phone?: string; code?: string };
  if (!phone || !code) return new Response("Missing phone or code", { status: 400 });

  const codeHash = await hashOtp(code);

  const row = await env.PORTAL_DB.prepare(
    `SELECT id FROM verification_codes
     WHERE user_id = ? AND channel = 'whatsapp' AND destination = ? AND code_hash = ?
       AND expires_at > datetime('now') AND consumed_at IS NULL
     ORDER BY created_at DESC LIMIT 1`,
  )
    .bind(userId, phone, codeHash)
    .first<{ id: string }>();

  if (!row) {
    return new Response("Invalid or expired code", { status: 400 });
  }

  await env.PORTAL_DB.batch([
    env.PORTAL_DB.prepare("UPDATE verification_codes SET consumed_at = datetime('now') WHERE id = ?").bind(row.id),
    env.PORTAL_DB.prepare("UPDATE users SET whatsapp = ?, whatsapp_verified = 1 WHERE id = ?").bind(phone, userId),
  ]);

  return Response.json({ ok: true });
};
