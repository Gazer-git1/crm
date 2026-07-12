import type { Env } from "../../lib/env";
import { getUserIdFromRequest } from "../../lib/session";

// GET   /api/profile — return the current user's profile, documents, financial info.
// PATCH /api/profile — update editable personal/contact fields.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const [user, documents, financial] = await Promise.all([
    env.PORTAL_DB.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first(),
    env.PORTAL_DB.prepare("SELECT label, value, verified FROM documents WHERE user_id = ?")
      .bind(userId)
      .all(),
    env.PORTAL_DB.prepare("SELECT * FROM financial_profiles WHERE user_id = ?")
      .bind(userId)
      .first(),
  ]);

  if (!user) return new Response("Not found", { status: 404 });

  return Response.json({ user, documents: documents.results, financial });
};

const EDITABLE_FIELDS = [
  "full_name",
  "date_of_birth",
  "nationality",
  "passport_number",
  "language",
  "marital_status",
  "address",
] as const;

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const payload = (await request.json()) as Record<string, string>;
  const updates = EDITABLE_FIELDS.filter((f) => payload[f] !== undefined);
  if (updates.length === 0) return new Response("No editable fields provided", { status: 400 });

  const setClause = updates.map((f) => `${f} = ?`).join(", ");
  const values = updates.map((f) => payload[f]);

  await env.PORTAL_DB.prepare(
    `UPDATE users SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
  )
    .bind(...values, userId)
    .run();

  return Response.json({ ok: true });
};
