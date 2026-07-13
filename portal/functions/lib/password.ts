// Cloudflare Workers' free plan caps CPU time at ~10ms/request. 210k iterations (the
// OWASP-recommended minimum) takes ~28ms and gets the request killed in production —
// 20k keeps this comfortably under the limit (~2.5-3ms), leaving headroom for the rest
// of the request. Trade-off accepted: weaker than best-practice, but functional on the
// free tier. Bump this back up (and move to Workers Paid, 30s CPU limit) if that changes.
const PBKDF2_ITERATIONS = 20_000;
const SALT_BYTES = 16;
const KEY_BYTES = 32;

function toHex(bytes: ArrayBuffer | Uint8Array) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function derive(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    KEY_BYTES * 8,
  );
  return new Uint8Array(bits);
}

// Stored format: pbkdf2$<iterations>$<salt-hex>$<hash-hex>
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await derive(password, salt);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toHex(salt)}$${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string) {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  const salt = fromHex(parts[2]);
  const expected = parts[3];

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_BYTES * 8,
  );
  const actual = toHex(bits);

  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
