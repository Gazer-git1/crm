import type { Env } from "../../lib/env";
import { getUserIdFromRequest } from "../../lib/session";

// GET /api/auth/session — returns the logged-in user, or 401 if not authenticated.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const userId = await getUserIdFromRequest(request, env);
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const user = await env.PORTAL_DB.prepare(
    "SELECT id, full_name, email, avatar_url FROM users WHERE id = ?",
  )
    .bind(userId)
    .first();

  if (!user) return new Response("Unauthorized", { status: 401 });

  return Response.json({ user });
};
