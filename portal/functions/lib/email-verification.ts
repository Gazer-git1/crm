import type { Env } from "./env";
import { generateOtp, hashOtp } from "./otp";
import { sendEmail, verificationCodeEmail } from "./email";

export async function issueEmailVerificationCode(env: Env, userId: string, email: string) {
  const code = generateOtp();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await env.PORTAL_DB.prepare(
    `INSERT INTO verification_codes (id, user_id, channel, destination, code_hash, expires_at)
     VALUES (?, ?, 'email', ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), userId, email, codeHash, expiresAt)
    .run();

  await sendEmail(env, email, "Confirm your email — Investors' Angels", verificationCodeEmail(code));
}
