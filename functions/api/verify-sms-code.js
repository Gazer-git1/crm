import { signToken } from '../_lib/otp.js';
import { json, readBody } from '../_lib/http.js';

const PROOF_TTL_MS = 30 * 60 * 1000;

function twilioAuthHeader(env) {
  return 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
}

export async function onRequestPost({ request, env }) {
  const { phone, code } = await readBody(request);
  const secret = env.OTP_SIGNING_SECRET;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = env;
  if (!secret || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    return json(501, { error: 'Phone verification is not configured yet.' });
  }
  if (!phone || !code) return json(400, { verified: false, error: 'Missing phone or code.' });

  const cleanPhone = String(phone).trim();

  let check;
  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`,
      {
        method: 'POST',
        headers: {
          Authorization: twilioAuthHeader(env),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ To: cleanPhone, Code: String(code).trim() })
      }
    );
    check = await res.json();
    if (!res.ok) throw new Error('Twilio error');
  } catch (err) {
    return json(400, { verified: false, error: 'Incorrect or expired code. Please try again.' });
  }

  if (check.status !== 'approved') {
    return json(400, { verified: false, error: 'Incorrect code. Please try again.' });
  }

  const proof = await signToken({ purpose: 'phone-verified', phone: cleanPhone }, secret, PROOF_TTL_MS);
  return json(200, { verified: true, proof });
}
