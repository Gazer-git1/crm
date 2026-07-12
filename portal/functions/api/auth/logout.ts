import type { Env } from "../../lib/env";
import { destroySession } from "../../lib/session";

// POST /api/auth/logout
export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const cookie = await destroySession(request, env);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
};
