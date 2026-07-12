import type { Env } from "../../../lib/env";
import { getUserIdFromRequest } from "../../../lib/session";
import { generateOtp, hashOtp } from "../../../lib/otp";

// POST /api/auth/whatsapp/start   { "phone": "+971501234567" }
// Sends a 6-digit code to the user's WhatsApp number via the Meta Cloud API.
// Requires WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN, and a Meta-approved
// authentication message template (here assumed to be named "portal_otp").
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { phone } = (await request.json()) as { phone?: string };
  if (!phone) return new Response("Missing phone", { status: 400 });

  const code = generateOtp();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await env.PORTAL_DB.prepare(
    `INSERT INTO verification_codes (id, user_id, channel, destination, code_hash, expires_at)
     VALUES (?, ?, 'whatsapp', ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), userId, phone, codeHash, expiresAt)
    .run();

  const waResponse = await fetch(
    `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: "portal_otp",
          language: { code: "en" },
          components: [
            { type: "body", parameters: [{ type: "text", text: code }] },
            {
              type: "button",
              sub_type: "url",
              index: "0",
              parameters: [{ type: "text", text: code }],
            },
          ],
        },
      }),
    },
  );

  if (!waResponse.ok) {
    return new Response("Failed to send WhatsApp code", { status: 502 });
  }

  return Response.json({ ok: true });
};
