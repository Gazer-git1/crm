import { hashCode, signToken, verifyToken } from '../_lib/otp.js';
import { json, readBody } from '../_lib/http.js';

const PROOF_TTL_MS = 30 * 60 * 1000;

export async function onRequestPost({ request, env }) {
  const { email, code, token } = await readBody(request);
  const secret = env.OTP_SIGNING_SECRET;
  if (!secret) return json(500, { error: 'Email verification is not configured yet.' });

  const cleanEmail = String(email || '').trim().toLowerCase();
  const payload = await verifyToken(token, secret);

  if (!payload || payload.purpose !== 'email-otp' || payload.email !== cleanEmail) {
    return json(400, { verified: false, error: 'This code has expired. Please request a new one.' });
  }
  if (!code || (await hashCode(String(code).trim(), secret)) !== payload.codeHash) {
    return json(400, { verified: false, error: 'Incorrect code. Please try again.' });
  }

  const proof = await signToken({ purpose: 'email-verified', email: cleanEmail }, secret, PROOF_TTL_MS);
  return json(200, { verified: true, proof });
}
