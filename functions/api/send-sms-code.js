import { json, readBody } from '../_lib/http.js';

const PHONE_RE = /^\+[1-9]\d{7,14}$/;

function twilioAuthHeader(env) {
  return 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);
}

export async function onRequestPost({ request, env }) {
  const { phone } = await readBody(request);
  if (!phone || !PHONE_RE.test(String(phone).trim())) {
    return json(400, { error: 'Please enter a valid phone number in international format, e.g. +971501234567.' });
  }
  const cleanPhone = String(phone).trim();

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    return json(501, { error: 'Phone verification is not configured yet. Please continue with email verification only for now.' });
  }

  try {
    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`,
      {
        method: 'POST',
        headers: {
          Authorization: twilioAuthHeader(env),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ To: cleanPhone, Channel: 'sms' })
      }
    );
    if (!res.ok) throw new Error(`Twilio error ${res.status}`);
  } catch (err) {
    return json(502, { error: 'Could not send the SMS code. Please check the number and try again.' });
  }

  return json(200, { status: 'pending' });
}
