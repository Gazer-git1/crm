import type { Env } from "../../lib/env";
import { getUserIdFromRequest } from "../../lib/session";

// GET  /api/messages/:id — fetch a conversation's messages (ownership-checked).
// POST /api/messages/:id — send a new portal message into the conversation.
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const conversationId = params.id as string;

  const owned = await env.PORTAL_DB.prepare(
    "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
  )
    .bind(conversationId, userId)
    .first();
  if (!owned) return new Response("Not found", { status: 404 });

  const { results } = await env.PORTAL_DB.prepare(
    `SELECT id, sender_type, sender_name, channel, body, read_at, created_at
     FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`,
  )
    .bind(conversationId)
    .all();

  return Response.json({ messages: results });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const conversationId = params.id as string;
  const owned = await env.PORTAL_DB.prepare(
    "SELECT id FROM conversations WHERE id = ? AND user_id = ?",
  )
    .bind(conversationId, userId)
    .first();
  if (!owned) return new Response("Not found", { status: 404 });

  const { body } = (await request.json()) as { body?: string };
  if (!body?.trim()) return new Response("Message body required", { status: 400 });

  const id = crypto.randomUUID();
  await env.PORTAL_DB.batch([
    env.PORTAL_DB.prepare(
      `INSERT INTO messages (id, conversation_id, sender_type, sender_name, channel, body, read_at)
       VALUES (?, ?, 'user', 'You', 'portal', ?, datetime('now'))`,
    ).bind(id, conversationId, body),
    env.PORTAL_DB.prepare(
      "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?",
    ).bind(conversationId),
  ]);

  return Response.json({ id }, { status: 201 });
};
