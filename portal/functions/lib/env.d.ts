export interface Env {
  PORTAL_DB: D1Database;
  PORTAL_FILES: R2Bucket;
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_REDIRECT_URI: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  WHATSAPP_ACCESS_TOKEN: string;
}
