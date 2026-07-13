'use strict';

const { hashCode, signToken, verifyToken } = require('./_lib/otp');
const { json, readBody } = require('./_lib/http');

const PROOF_TTL_MS = 30 * 60 * 1000;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  const { email, code, token } = readBody(event);
  const secret = process.env.OTP_SIGNING_SECRET;
  if (!secret) return json(500, { error: 'Email verification is not configured yet.' });

  const cleanEmail = String(email || '').trim().toLowerCase();
  const payload = verifyToken(token, secret);

  if (!payload || payload.purpose !== 'email-otp' || payload.email !== cleanEmail) {
    return json(400, { verified: false, error: 'This code has expired. Please request a new one.' });
  }
  if (!code || hashCode(String(code).trim(), secret) !== payload.codeHash) {
    return json(400, { verified: false, error: 'Incorrect code. Please try again.' });
  }

  const proof = signToken({ purpose: 'email-verified', email: cleanEmail }, secret, PROOF_TTL_MS);
  return json(200, { verified: true, proof });
};
