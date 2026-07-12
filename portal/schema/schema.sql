-- Cloudflare D1 schema for the Investors' Angels client portal.
-- Apply with: npm run db:migrate:local  (or db:migrate:remote once the D1 database exists)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,               -- uuid
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,                -- PBKDF2 hash; null for OAuth-only accounts (e.g. Google)
  phone TEXT,
  phone_verified INTEGER NOT NULL DEFAULT 0,
  whatsapp TEXT,
  whatsapp_verified INTEGER NOT NULL DEFAULT 0,
  avatar_url TEXT,
  date_of_birth TEXT,
  nationality TEXT,
  passport_number TEXT,
  language TEXT,
  marital_status TEXT,
  address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One row per external identity provider linked to a user (Google OAuth, etc).
CREATE TABLE IF NOT EXISTS oauth_identities (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,            -- 'google'
  provider_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,               -- opaque session token (hashed)
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- One-time codes for WhatsApp / SMS / email verification.
CREATE TABLE IF NOT EXISTS verification_codes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,             -- 'whatsapp' | 'sms' | 'email'
  destination TEXT NOT NULL,         -- phone number or email address
  code_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS advisors (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  role_title TEXT NOT NULL DEFAULT 'Homeownership Advisor',
  phone TEXT,
  email TEXT,
  avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  application_number TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  advisor_id TEXT REFERENCES advisors(id),
  property_name TEXT NOT NULL,
  property_location TEXT,
  property_price TEXT,
  plan_label TEXT,
  plan_detail TEXT,
  status TEXT NOT NULL DEFAULT 'In Progress',
  next_step_title TEXT,
  next_step_detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,               -- 'Passport' | 'Emirates ID' | 'Proof of Address' ...
  value TEXT,                        -- document number / descriptive value
  file_key TEXT,                     -- R2 object key
  verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS financial_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  employment_status TEXT,
  occupation TEXT,
  monthly_income_range TEXT,
  source_of_income TEXT,
  bank_name TEXT,
  bank_account_last4 TEXT,
  bank_verified INTEGER NOT NULL DEFAULT 0
);

-- A conversation groups messages exchanged over one or more channels
-- (portal / email / whatsapp / system) between a user and an advisor or team.
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  advisor_id TEXT REFERENCES advisors(id),
  title TEXT NOT NULL,
  primary_channel TEXT NOT NULL DEFAULT 'portal', -- 'portal' | 'email' | 'whatsapp' | 'system'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL,         -- 'user' | 'advisor' | 'system'
  sender_name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'portal', -- which channel this specific message arrived/was sent on
  body TEXT NOT NULL,
  external_id TEXT,                  -- id from email/WhatsApp provider, for dedup on sync
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_key TEXT NOT NULL,            -- R2 object key
  content_type TEXT,
  size_bytes INTEGER
);

CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
