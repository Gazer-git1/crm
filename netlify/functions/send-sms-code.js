'use strict';

const { json, readBody } = require('./_lib/http');

const PHONE_RE = /^\+[1-9]\d{7,14}$/;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const { phone } = readBody(event);
  if (!phone || !PHONE_RE.test(String(phone).trim())) {
    return json(400, { error: 'Please enter a valid phone number in international format, e.g. +971501234567.' });
  }
  const cleanPhone = String(phone).trim();

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    return json(501, { error: 'Phone verification is not configured yet. Please continue with email verification only for now.' });
  }

  const twilio = require('twilio');
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  try {
    await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verifications.create({ to: cleanPhone, channel: 'sms' });
  } catch (err) {
    return json(502, { error: 'Could not send the SMS code. Please check the number and try again.' });
  }

  return json(200, { status: 'pending' });
};
