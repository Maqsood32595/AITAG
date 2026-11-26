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

/**
 * Derives a deterministic 256-bit AES key from an arbitrary passphrase/hex secret.
 */
function deriveAes256Key(secret) {
  if (!secret || typeof secret !== 'string' || secret.length < 16) {
    throw new Error('BACKUP_ENCRYPTION_KEY must be at least 16 characters (32+ recommended).');
  }
  return crypto.createHash('sha256').update(secret, 'utf8').digest();
}

/**
 * Encrypts a Buffer using authenticated AES-256-GCM encryption.
 * Wire format: magic "AITAGENC1" (9 bytes) + 12-byte IV + 16-byte AuthTag + ciphertext
 */
function encryptBuffer(plainBuffer, secret) {
  const key = deriveAes256Key(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const header = Buffer.from('AITAGENC1', 'utf8');
  return Buffer.concat([header, iv, authTag, ciphertext]);
}

/**
 * Decrypts a Buffer created by encryptBuffer(). Throws on tampering or wrong key.
 */
function decryptBuffer(encryptedBuffer, secret) {
  const MAGIC = 'AITAGENC1';
  if (!Buffer.isBuffer(encryptedBuffer) || encryptedBuffer.length < 9 + 12 + 16) {
    throw new Error('Invalid encrypted backup payload');
  }
  const magic = encryptedBuffer.subarray(0, 9).toString('utf8');
  if (magic !== MAGIC) {
    throw new Error('Unsupported encrypted backup format header');
  }
  const key = deriveAes256Key(secret);
  const iv = encryptedBuffer.subarray(9, 21);
  const authTag = encryptedBuffer.subarray(21, 37);
  const ciphertext = encryptedBuffer.subarray(37);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
}

module.exports = {
  verifyHmacSignature,
  validatePasswordStrength,
  verifyJwtEntropy,
  deriveAes256Key,
  encryptBuffer,
  decryptBuffer,
  COMMON_INSECURE_PASSWORDS
};
