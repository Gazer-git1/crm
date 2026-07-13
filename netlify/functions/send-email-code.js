'use strict';

const { Resend } = require('resend');
const { generateCode, hashCode, signToken } = require('./_lib/otp');
const { json, readBody } = require('./_lib/http');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 10 * 60 * 1000;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const { email } = readBody(event);
  if (!email || !EMAIL_RE.test(String(email).trim())) {
    return json(400, { error: 'Please enter a valid email address.' });
  }
  const cleanEmail = String(email).trim().toLowerCase();

  const secret = process.env.OTP_SIGNING_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) {
    return json(500, { error: 'Email verification is not configured yet.' });
  }

  const code = generateCode();
  const token = signToken(
    { purpose: 'email-otp', email: cleanEmail, codeHash: hashCode(code, secret) },
    secret,
    CODE_TTL_MS
  );

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromAddress = process.env.APPLICATION_FROM_EMAIL || 'onboarding@resend.dev';

  try {
    await resend.emails.send({
      from: `Investors' Angels <${fromAddress}>`,
      to: cleanEmail,
      subject: `Your verification code: ${code}`,
      text: `Your verification code is ${code}. It expires in 10 minutes.`,
      html: `<p>Your verification code is <strong>${code}</strong>.</p><p>It expires in 10 minutes.</p>`
    });
  } catch (err) {
    return json(502, { error: 'Could not send the verification email. Please try again.' });
  }

  return json(200, { token, expiresInMs: CODE_TTL_MS });
};
