/**
 * Grandchild Security Layer 7: Multipart Upload Validation & Anti-XSS File Guard
 * Location: server/features/aitag-security-guard/guards/upload-guard.js
 */

const path = require('path');

const ALLOWED_MIME_TYPES = [
  // Safe Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Safe Documents
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  // Safe Videos
  'video/mp4',
  'video/webm',
  'video/quicktime'
];

const ALLOWED_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.pdf', '.zip', '.txt',
  '.mp4', '.webm', '.mov'
];

const BANNED_EXTENSIONS = [
  '.html', '.htm', '.svg', '.php', '.phtml',
  '.exe', '.bat', '.cmd', '.sh', '.vbs',
  '.js', '.cjs', '.mjs', '.jar', '.apk', '.bin'
];

/**
 * Validates a single uploaded file object (from multer or custom handler)
 */
function validateUploadedFile(file) {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  const filename = file.originalname || file.name || '';
  const ext = path.extname(filename).toLowerCase();
  const mime = (file.mimetype || file.type || '').toLowerCase();

  // 1. Explicit banned extension check (prevents Stored XSS via HTML/SVG and executable uploads)
  if (BANNED_EXTENSIONS.includes(ext) || ext === '.svg' || ext === '.html' || ext === '.htm') {
    return {
      valid: false,
      error: `File type '${ext}' is strictly prohibited for security reasons (Stored XSS and executable prevention).`
    };
  }

  // 2. Allowed extension check
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file extension '${ext}'. Allowed formats: JPG, PNG, WEBP, GIF, PDF, ZIP, TXT, MP4, WebM.`
    };
  }

  // 3. Allowed MIME type check
  if (mime && !ALLOWED_MIME_TYPES.includes(mime)) {
    return {
      valid: false,
      error: `Disallowed MIME type '${mime}'. File content does not match permitted document or media formats.`
    };
  }

  return { valid: true };
}

/**
 * Multer fileFilter function
 */
function secureMulterFilter(req, file, cb) {
  const check = validateUploadedFile(file);
  if (!check.valid) {
    return cb(new Error(check.error));
  }
  cb(null, true);
}

module.exports = {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  BANNED_EXTENSIONS,
  validateUploadedFile,
  secureMulterFilter
};
