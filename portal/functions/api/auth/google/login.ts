import type { Env } from "../../../lib/env";

// GET /api/auth/google/login
// Redirects the browser into Google's OAuth consent screen.
// Requires GOOGLE_CLIENT_ID and GOOGLE_REDIRECT_URI to be set (wrangler secret / Pages env vars).
export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
  });

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302,
  );
};
