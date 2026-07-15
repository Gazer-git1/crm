import { verifyToken } from '../_lib/otp.js';
import { json, readBody } from '../_lib/http.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOPIC_LABELS = {
  leasing: 'Leasing a Home',
  investing: 'Investing',
  partnership: 'Partnership',
  other: 'Something Else'
};

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

/* Phone verification is only enforced when Twilio is actually configured on
   this deployment — until then the form stays usable with email verification
   alone instead of being permanently blocked on a provider that isn't set up. */
export async function onRequestPost({ request, env }) {
  const body = await readBody(request);
  const topic = TOPIC_LABELS[body.topic] ? body.topic : 'leasing';
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = String(body.phone || '').trim();
  const message = String(body.message || '').trim();

  if (!name || !email || !EMAIL_RE.test(email)) {
    return json(400, { error: 'Please provide your name and a valid email.' });
  }

  const secret = env.OTP_SIGNING_SECRET;
  const resendKey = env.RESEND_API_KEY;
  if (!secret || !resendKey) {
    return json(500, { error: 'Applications are not accepting submissions right now. Please try again shortly.' });
  }

  const emailProof = await verifyToken(body.emailProof, secret);
  if (!emailProof || emailProof.purpose !== 'email-verified' || emailProof.email !== email) {
    return json(400, { error: 'Please verify your email before submitting.' });
  }

  const smsConfigured = !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VERIFY_SERVICE_SID);
  let phoneVerified = false;
  if (smsConfigured) {
    const phoneProof = await verifyToken(body.phoneProof, secret);
    if (!phoneProof || phoneProof.purpose !== 'phone-verified' || phoneProof.phone !== phone) {
      return json(400, { error: 'Please verify your phone number before submitting.' });
    }
    phoneVerified = true;
  }

  const fromAddress = env.APPLICATION_FROM_EMAIL || 'onboarding@resend.dev';
  const notifyList = (env.APPLICATION_NOTIFY_EMAILS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const topicLabel = TOPIC_LABELS[topic];
  const phoneStatus = phoneVerified ? ' (verified)' : smsConfigured ? '' : ' (verification not yet enabled)';
  const notifyText = [
    `New application from ${name}`,
    `Interested in: ${topicLabel}`,
    `Email: ${email} (verified)`,
    `Phone: ${phone || 'not provided'}${phoneStatus}`,
    '',
    message ? `Message:\n${message}` : ''
  ].filter(Boolean).join('\n');

  try {
    if (notifyList.length) {
      await sendResendEmail(env, {
        from: `Investors' Angels Applications <${fromAddress}>`,
        to: notifyList,
        subject: `New ${topicLabel} inquiry: ${name}`,
        text: notifyText
      });
    }

    await sendResendEmail(env, {
      from: `Investors' Angels <${fromAddress}>`,
      to: email,
      subject: 'We received your application',
      text: `Hi ${name},\n\nThanks for reaching out — our team will review your submission and get back to you shortly.`
    });
  } catch (err) {
    return json(502, { error: 'Could not send your application. Please try again.' });
  }

  return json(200, { success: true });
}
