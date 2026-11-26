/**
 * Grandchild Security Layer 11: Runtime & Startup Secret Integrity Guard
 * Location: server/features/domain-security/grandchildren/boot-guard.js
 */

const { verifyJwtEntropy } = require('./crypto-guard');

/**
 * Audits runtime security environment variables.
 * In strict production (outside PIET runs), weak/default JWT secrets and
 * missing service-role credentials are flagged as critical errors.
 */
function validateRuntimeSecurity(env = process.env) {
  const isProd = env.NODE_ENV === 'production' && env.PIET_RUN !== 'true';
  const errors = [];
  const warnings = [];

  const jwtSecret = env.JWT_SECRET || '';
  if (!verifyJwtEntropy(jwtSecret)) {
    const msg = 'JWT_SECRET is missing, default, or under 32 characters (high risk of JWT forgery).';
    if (isProd) errors.push(msg);
    else warnings.push(msg);
  }

  if (!env.SUPABASE_URL) {
    const msg = 'SUPABASE_URL is not configured explicitly.';
    if (isProd) errors.push(msg);
    else warnings.push(msg);
  }

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!serviceKey || serviceKey === 'PASTE_YOUR_SERVICE_ROLE_KEY_HERE') {
    const msg = 'SUPABASE_SERVICE_ROLE_KEY is missing or placeholder.';
    if (isProd) errors.push(msg);
    else warnings.push(msg);
  }

  if (env.ALLOW_DEV_SEED_LOGINS === 'true' && isProd) {
    errors.push('ALLOW_DEV_SEED_LOGINS must never be enabled in production.');
  }

  return {
    secure: errors.length === 0,
    isProd,
    errors,
    warnings,
  };
}

function assertSecureRuntime(env = process.env) {
  const report = validateRuntimeSecurity(env);
  for (const w of report.warnings) {
    console.warn(`⚠️ [BootGuard] ${w}`);
  }
  if (!report.secure) {
    throw new Error(`[BootGuard] Critical production security failure:\n - ${report.errors.join('\n - ')}`);
  }
  return report;
}

module.exports = {
  validateRuntimeSecurity,
  assertSecureRuntime,
};
