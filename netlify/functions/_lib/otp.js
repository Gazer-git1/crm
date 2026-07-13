'use strict';

const crypto = require('crypto');

function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function hashCode(code, secret) {
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

function sign(payloadB64, secret) {
  return crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
}

/* Stateless signed token: payload + expiry, HMAC'd with a server-only secret.
   Netlify Functions have no shared memory between invocations, so this stands
   in for a database — anything that needs to survive between the "send code"
   and "verify code" calls (or between "verify" and the final "submit") rides
   inside the token itself instead of being looked up server-side. */
function signToken(payload, secret, ttlMs) {
  const body = Object.assign({}, payload, { exp: Date.now() + ttlMs });
  const payloadB64 = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = sign(payloadB64, secret);
  return payloadB64 + '.' + sig;
}

function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return null;
  const parts = token.split('.');
  const payloadB64 = parts[0];
  const sig = parts[1] || '';
  const expected = sign(payloadB64, secret);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch (e) {
    return null;
  }
  if (!payload.exp || Date.now() > payload.exp) return null;
  return payload;
}

module.exports = { generateCode, hashCode, signToken, verifyToken };
