import { generateCode, hashCode, signToken } from '../_lib/otp.js';
import { json, readBody } from '../_lib/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 10 * 60 * 1000;

async function sendResendEmail(env, payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function onRequestPost({ request, env }) {
  const { email } = await readBody(request);
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return json(400, { error: 'Please enter a valid email address.' });
  }
  const cleanEmail = String(email).trim().toLowerCase();

  const secret = env.OTP_SIGNING_SECRET;
  if (!secret || !env.RESEND_API_KEY) {
    return json(500, { error: 'Email verification is not configured yet.' });
  }

  const code = generateCode();
  const token = await signToken(
    { purpose: 'email-otp', email: cleanEmail, codeHash: await hashCode(code, secret) },
    secret,
    CODE_TTL_MS
  );

  const fromAddress = env.APPLICATION_FROM_EMAIL || 'onboarding@resend.dev';

  try {
    await sendResendEmail(env, {
      from: `Investors' Angels <${fromAddress}>`,
      to: cleanEmail,
      subject: `Your verification code: ${code}`,
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`
    });
  } catch (err) {
    return json(502, { error: 'Could not send the verification email. Please try again.', debug: String(err && err.message || err) });
  }

  return json(200, { token, expiresInMs: CODE_TTL_MS });
}
