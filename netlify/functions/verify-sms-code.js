'use strict';

const { signToken } = require('./_lib/otp');
const { json, readBody } = require('./_lib/http');

const PROOF_TTL_MS = 30 * 60 * 1000;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const { phone, code } = readBody(event);
  const secret = process.env.OTP_SIGNING_SECRET;
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  if (!secret || !TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    return json(501, { error: 'Phone verification is not configured yet.' });
  }
  if (!phone || !code) return json(400, { verified: false, error: 'Missing phone or code.' });

  const cleanPhone = String(phone).trim();
  const twilio = require('twilio');
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  let check;
  try {
    check = await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verificationChecks.create({
      to: cleanPhone,
      code: String(code).trim()
    });
  } catch (err) {
    return json(400, { verified: false, error: 'Incorrect or expired code. Please try again.' });
  }

  if (check.status !== 'approved') {
    return json(400, { verified: false, error: 'Incorrect code. Please try again.' });
  }

  const proof = signToken({ purpose: 'phone-verified', phone: cleanPhone }, secret, PROOF_TTL_MS);
  return json(200, { verified: true, proof });
};
