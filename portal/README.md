# Investors' Angels — Client Portal

Client-facing dashboard (Messages + Profile, more sections to follow) built with:

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Cloudflare Pages Functions (`functions/api/**`)
- **Database**: Cloudflare D1 (`schema/schema.sql`)
- **File storage**: Cloudflare R2 (documents, attachments)
- **Auth**: Email/password (working end-to-end, incl. email verification) + Google OAuth and
  WhatsApp OTP (scaffolded, not wired to live accounts yet)

Email/password signup, login, logout and email verification are fully functional against local
D1 (`npm run pages:dev`) — every portal route requires a logged-in **and** email-verified user
(see `RequireAuth` / `RequireVerifiedEmail` in `src/App.tsx`). The UI pages themselves
(`/messages`, `/profile`) still run on mock data in `src/data/mock.ts` — swap those for calls to
`/api/*` once the Cloudflare account below is set up.

Without a `RESEND_API_KEY` configured, verification emails are logged to the Worker console
instead of sent (see `functions/lib/email.ts`) — useful for local testing, find the code with
`npm run pages:dev` and watching the terminal after signing up.

## Local development

```bash
npm install
npm run dev          # frontend only, mock data, http://localhost:5173
```

To run the full stack locally (frontend + Pages Functions + local D1):

```bash
npm run build
npm run pages:dev     # http://localhost:8788, D1 emulated locally
npm run db:migrate:local
```

## One-time setup checklist (requires your accounts — I can't create these for you)

1. **Cloudflare account** (free) → create a Pages project named `investors-angels-portal`.
   - `wrangler d1 create investors-angels-portal-db` → paste the `database_id` into `wrangler.toml`.
   - `wrangler r2 bucket create investors-angels-portal-files`.
   - Generate a `CLOUDFLARE_API_TOKEN` (Pages:Edit, D1:Edit, R2:Edit) and add it, plus your
     `CLOUDFLARE_ACCOUNT_ID`, as GitHub repo secrets — the deploy workflow
     (`.github/workflows/deploy-portal.yml`) needs both.
   - Also add a GitHub repo **variable** (not secret) `CLOUDFLARE_READY` = `true`. The deploy
     step is gated on this so CI stays green (skips deploy, doesn't fail) until you've actually
     set up Cloudflare — otherwise every push fails with a "missing CLOUDFLARE_API_TOKEN" error.
   - `wrangler pages secret put SESSION_SECRET` (any long random string).
   - By default the deployed site lives at `investors-angels-portal.pages.dev`, **not**
     `i-angels.com/investor-portal`. Decision: serve it at **`portal.i-angels.com`** — add a
     `Custom domain` for that hostname in the Pages project settings, then add the CNAME record
     it gives you wherever `i-angels.com` DNS is currently managed (no need to move the main
     site's DNS to Cloudflare — a single CNAME record is enough, and it's free).

2. **Google OAuth** (free) — Google Cloud Console → APIs & Services → Credentials →
   OAuth Client ID (Web application).
   - Authorized redirect URI: `https://portal.i-angels.com/api/auth/google/callback`.
   - `wrangler pages secret put GOOGLE_CLIENT_ID`
   - `wrangler pages secret put GOOGLE_CLIENT_SECRET`
   - `wrangler pages secret put GOOGLE_REDIRECT_URI`

3. **WhatsApp verification** — Meta Business Suite → WhatsApp → API Setup.
   - Requires a verified Meta Business account and a dedicated WhatsApp Business phone number.
   - Create and get approval for an authentication message template (referenced as
     `portal_otp` in `functions/api/auth/whatsapp/start.ts`) — Meta review can take a few days.
   - `wrangler pages secret put WHATSAPP_PHONE_NUMBER_ID`
   - `wrangler pages secret put WHATSAPP_ACCESS_TOKEN`
   - Free tier covers a limited number of conversations/month; beyond that it's pay-per-message.

4. **Resend** (free, resend.com) — used to send the email-verification code on signup.
   - Sign up, grab an API key. For testing you can send from `onboarding@resend.dev` with no
     domain setup; for production, verify `i-angels.com` (or a subdomain) as a sending domain.
   - `wrangler pages secret put RESEND_API_KEY`
   - `wrangler pages secret put EMAIL_FROM` (e.g. `Investors' Angels <portal@i-angels.com>`)

Once secrets are set and the D1 database/tables exist (`npm run db:migrate:remote`), point the
frontend at the real endpoints instead of `src/data/mock.ts`.

## Project layout

```
portal/
  src/                 React app (pages, components, mock data)
  functions/api/       Cloudflare Pages Functions (backend API)
  schema/schema.sql    D1 database schema
  wrangler.toml        Cloudflare bindings config
```
