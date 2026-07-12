import type { Env } from "./env";

// Sends transactional email via Resend (https://resend.com). Requires RESEND_API_KEY
// and EMAIL_FROM (a verified sender, or onboarding@resend.dev for testing) to be set.
// If RESEND_API_KEY isn't configured yet (local dev, or before the account is set up),
// logs the email instead of sending it so the rest of the flow stays testable.
export async function sendEmail(env: Env, to: string, subject: string, html: string) {
  if (!env.RESEND_API_KEY) {
    console.log(`[email:dev] Would send to ${to} — ${subject}\n${html}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email: ${res.status} ${await res.text()}`);
  }
}

export function verificationCodeEmail(code: string) {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <p>Hi,</p>
      <p>Your Investors' Angels portal verification code is:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
  `;
}
