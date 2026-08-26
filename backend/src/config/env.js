// Centralized, validated environment loading.
// Every other module reads config from here instead of process.env
// directly — that way a missing secret fails fast at boot, not
// halfway through a request.

require('dotenv').config();

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // Fail loudly at startup rather than limping along with an
  // undefined Supabase client that would silently break auth.
  // eslint-disable-next-line no-console
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    // service role key bypasses RLS — used ONLY server-side,
    // ONLY for admin-style operations (audit log writes, token
    // verification). Never send this to the frontend.
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  cors: {
    // comma-separated list of allowed origins, e.g.
    // "http://localhost:3000,https://your-frontend.vercel.app"
    allowedOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  },
};
