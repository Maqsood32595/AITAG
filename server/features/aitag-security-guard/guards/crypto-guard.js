/**
 * Grandchild Security Layer 8: Cryptographic Verification & Secret Hygiene Guard
 * Location: server/features/aitag-security-guard/guards/crypto-guard.js
 */

const crypto = require('crypto');

const COMMON_INSECURE_PASSWORDS = [
  'admin',
  'password',
  '123456',
  'qwerty',
  'admin123',
  'password123',
  'welcome',
  'letmein'
];

/**
 * Timing-Safe Webhook HMAC Signature Verification
 */
function verifyHmacSignature(payload, signatureHeader, secret) {
  if (!payload || !signatureHeader || !secret) {
    return { verified: false, reason: 'Missing payload, signature, or secret' };
  }

  try {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const computedSignature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    const cleanSignature = signatureHeader.replace(/^sha256=/, '');

    const computedBuffer = Buffer.from(computedSignature, 'utf8');
    const providedBuffer = Buffer.from(cleanSignature, 'utf8');

    if (computedBuffer.length !== providedBuffer.length) {
      return { verified: false, reason: 'Signature length mismatch' };
    }

    const match = crypto.timingSafeEqual(computedBuffer, providedBuffer);
    return { verified: match, reason: match ? 'Valid' : 'Signature mismatch' };
  } catch (err) {
    return { verified: false, reason: `Verification error: ${err.message}` };
  }
}

/**
 * Validates password strength and rejects common trivial passwords
 */
function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password must be a string' };
  }

  const clean = password.toLowerCase().trim();
  if (COMMON_INSECURE_PASSWORDS.includes(clean)) {
    return { valid: false, error: 'Password is too common or insecure. Please choose a stronger password.' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }

  return { valid: true };
}

/**
 * Validates JWT Secret Entropy
 */
function verifyJwtEntropy(secret) {
  if (!secret || typeof secret !== 'string') return false;
  const isDefaultDev = secret.includes('secret-2026') || secret === 'aitag-fractal-kernel-jwt-secret-2026';
  return secret.length >= 32 && !isDefaultDev;
}

module.exports = {
  verifyHmacSignature,
  validatePasswordStrength,
  verifyJwtEntropy,
  COMMON_INSECURE_PASSWORDS
};
