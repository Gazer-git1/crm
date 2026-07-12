import type { Env } from "../../../lib/env";
import { createSession } from "../../../lib/session";

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

// GET /api/auth/google/callback?code=...
// Exchanges the auth code for tokens, upserts the user, and starts a session.
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (!code) {
    return new Response("Missing authorization code", { status: 400 });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    return new Response("Google token exchange failed", { status: 502 });
  }

  const tokens = (await tokenResponse.json()) as GoogleTokenResponse;

  const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!userInfoResponse.ok) {
    return new Response("Failed to fetch Google profile", { status: 502 });
  }
  const googleUser = (await userInfoResponse.json()) as GoogleUserInfo;

  const existingIdentity = await env.PORTAL_DB.prepare(
    "SELECT user_id FROM oauth_identities WHERE provider = 'google' AND provider_user_id = ?",
  )
    .bind(googleUser.sub)
    .first<{ user_id: string }>();

  let userId = existingIdentity?.user_id;

  if (!userId) {
    userId = crypto.randomUUID();
    await env.PORTAL_DB.prepare(
      `INSERT INTO users (id, full_name, email, email_verified, avatar_url)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (email) DO UPDATE SET full_name = excluded.full_name`,
    )
      .bind(userId, googleUser.name, googleUser.email, googleUser.email_verified ? 1 : 0, googleUser.picture ?? null)
      .run();

    await env.PORTAL_DB.prepare(
      "INSERT INTO oauth_identities (id, user_id, provider, provider_user_id) VALUES (?, ?, 'google', ?)",
    )
      .bind(crypto.randomUUID(), userId, googleUser.sub)
      .run();
  }

  const cookie = await createSession(env, userId);

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": cookie,
    },
  });
};
