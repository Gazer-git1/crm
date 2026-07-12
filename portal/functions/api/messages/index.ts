import type { Env } from "../../lib/env";
import { getUserIdFromRequest } from "../../lib/session";

// GET /api/messages — list the current user's conversations, newest first.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { results } = await env.PORTAL_DB.prepare(
    `SELECT c.id, c.title, c.primary_channel,
            (SELECT body FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
            (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.read_at IS NULL AND m.sender_type != 'user') AS unread_count,
            c.updated_at
     FROM conversations c
     WHERE c.user_id = ?
     ORDER BY c.updated_at DESC`,
  )
    .bind(userId)
    .all();

  return Response.json({ conversations: results });
};
