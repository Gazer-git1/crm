/* Cloudflare Pages Functions run on the Workers runtime (V8 isolates), not
   Node.js — no Buffer, no node:crypto by default. Everything here uses only
   Web-standard APIs (crypto.subtle, TextEncoder/Decoder, btoa/atob) so it
   needs no compatibility flags and runs identically in Node (for local
   testing) and in production. */

function bytesToBase64Url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const keyCache = new Map();

async function getHmacKey(secret) {
  if (keyCache.has(secret)) return keyCache.get(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
  keyCache.set(secret, key);
  return key;
}

async function hmacSignBytes(data, secret) {
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

export function generateCode() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return String(arr[0] % 1000000).padStart(6, '0');
}

export async function hashCode(code, secret) {
  const bytes = await hmacSignBytes(String(code), secret);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* Stateless signed token: payload + expiry, HMAC'd with a server-only secret.
   Pages Functions have no shared memory between invocations, so this stands
   in for a database — anything that needs to survive between the "send code"
   and "verify code" calls (or between "verify" and the final "submit") rides
   inside the token itself instead of being looked up server-side. */
export async function signToken(payload, secret, ttlMs) {
  const body = Object.assign({}, payload, { exp: Date.now() + ttlMs });
  const payloadB64 = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(body)));
  const sig = bytesToBase64Url(await hmacSignBytes(payloadB64, secret));
  return payloadB64 + '.' + sig;
}

export async function verifyToken(token, secret) {
  if (!token || typeof token !== 'string' || token.indexOf('.') === -1) return null;
  const [payloadB64, sig] = token.split('.');
  const key = await getHmacKey(secret);
  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    base64UrlToBytes(sig || ''),
    new TextEncoder().encode(payloadB64)
  );
  if (!valid) return null;

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadB64)));
  } catch (e) {
    return null;
  }
  if (!payload.exp || Date.now() > payload.exp) return null;
  return payload;
}
