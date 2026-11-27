/**
 * AITAG Auth Service — Resilient JWT Auth with Supabase + Fast-Path Seed Fallback
 * Fractal Kernel Slice: aitag-auth
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../../../.env') });
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../../../../supabase');
const registrationNotifier = require('./registration-notifier');

const { verifyJwtEntropy } = require('../../../domain-security/grandchildren/crypto-guard');

function resolveJwtSecret() {
  const configured = process.env.JWT_SECRET;
  if (verifyJwtEntropy(configured) || (process.env.NODE_ENV !== 'production' && configured)) {
    return configured;
  }
  if (process.env.NODE_ENV === 'production' && process.env.PIET_RUN !== 'true') {
    // Never sign production tokens with the well-known default string; generate an ephemeral high-entropy runtime key
    const ephemeralSecret = crypto.randomBytes(48).toString('hex');
    console.error('🚨 [AuthService] Missing or weak JWT_SECRET in production — generated per-instance ephemeral secret. Set a 32+ char JWT_SECRET in Cloud Run/Render!');
    return ephemeralSecret;
  }
  return configured || 'aitag-dev-only-jwt-secret-local-2026';
}

const JWT_SECRET = resolveJwtSecret();
const JWT_EXPIRES = '7d';

// Ephemeral single-use password reset tokens (hashedToken -> { email, expiresAt })
const PASSWORD_RESET_TOKENS = new Map();

// Resilient in-memory seed users for zero-downtime logins
const SEED_USERS = [
  {
    id: 'd01195ee-2f6c-453b-a49a-71b6c5e17ebf',
    name: 'Mohammed Maqsood',
    email: 'l.maqsood.m@gmail.com',
    role: 'admin',
    photo_url: '',
    password_hash: bcrypt.hashSync('Password', 10),
    created_at: new Date().toISOString()
  },
  {
    id: '2c2a1ac3-12fb-4418-b418-9578fa1a726d',
    name: 'Moh Maq',
    email: 'maxmaqs@gmail.com',
    role: 'client',
    photo_url: '',
    password_hash: bcrypt.hashSync('Password', 10),
    created_at: new Date().toISOString()
  },
  {
    id: '6e36f593-b9e6-4ead-8266-31ac91cf44c5',
    name: 'User1 Admin',
    email: 'user1@aitag.com',
    role: 'admin',
    photo_url: '',
    password_hash: bcrypt.hashSync('admin', 10),
    created_at: new Date().toISOString()
  },
  {
    id: 'c0b2dcd3-346a-4633-b58e-78ce929fb56d',
    name: 'Client 1',
    email: 'client1@aitag.com',
    role: 'client',
    photo_url: '',
    password_hash: bcrypt.hashSync('admin', 10),
    created_at: new Date().toISOString()
  },
  {
    id: '0eaa9c88-d477-4308-bd37-f7ccf29c87f1',
    name: 'Expert 1',
    email: 'expert1@aitag.com',
    role: 'freelancer',
    photo_url: '',
    password_hash: bcrypt.hashSync('admin', 10),
    created_at: new Date().toISOString()
  }
];

class AuthService {
  signToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, photo_url: user.photo_url },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  async register({ name, email, password, photoURL, role }) {
    // Strict RBAC defense: public registration defaults to 'client'
    const ALLOWED_ROLES = ['client', 'freelancer'];
    const safeRole = (role && ALLOWED_ROLES.includes(role.toLowerCase().trim()))
      ? role.toLowerCase().trim()
      : 'client';

    // Check if email already exists in Supabase
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data: existing } = await supabase
          .from('aitag_users')
          .select('id')
          .eq('email', (email || '').trim().toLowerCase())
          .single();

        if (existing) {
          throw new Error('User already exists');
        }

        const password_hash = await bcrypt.hash(password, 10);

        const { data: user, error } = await supabase
          .from('aitag_users')
          .insert([{
            name,
            email: (email || '').trim().toLowerCase(),
            password_hash,
            photo_url: photoURL || '',
            role: safeRole
          }])
          .select('id, name, email, role, photo_url, created_at')
          .single();

        if (!error && user) {
          const token = this.signToken(user);
          registrationNotifier.notifyNewUserRegistration({
            user,
            method: 'Manual Registration (Email/Password)'
          }).catch(err => console.warn('[AuthService] Registration alert error:', err.message));
          return { user, token };
        }
      }
    } catch (e) {
      if (e.message === 'User already exists' || e.message === 'Email already registered') {
        throw new Error('User already exists');
      }
      console.warn('[AuthService] Supabase register fallback:', e.message);
    }

    // In-memory registration fallback (check for duplicate)
    const cleanEmail = (email || '').trim().toLowerCase();
    if (SEED_USERS.some(u => u.email === cleanEmail)) {
      throw new Error('User already exists');
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email: cleanEmail,
      role: safeRole,
      photo_url: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      password_hash,
      created_at: new Date().toISOString()
    };
    SEED_USERS.push(newUser);
    const { password_hash: _, ...safeUser } = newUser;
    const token = this.signToken(safeUser);
    registrationNotifier.notifyNewUserRegistration({
      user: safeUser,
      method: 'Manual Registration (Email/Password)'
    }).catch(err => console.warn('[AuthService] Registration alert error:', err.message));
    return { user: safeUser, token };
  }

  async login({ email, password }) {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Try Supabase lookup
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data: user, error } = await supabase
          .from('aitag_users')
          .select('id, name, email, password_hash, role, photo_url, created_at')
          .eq('email', cleanEmail)
          .single();

        if (!error && user) {
          const valid = await bcrypt.compare(password, user.password_hash);
          if (valid) {
            const { password_hash, ...safeUser } = user;
            const token = this.signToken(safeUser);
            return { user: safeUser, token };
          }
        }
      }
    } catch (e) {
      console.warn('[AuthService] Supabase query notice during login:', e.message);
    }

    // 2. Try Seed Fallback (only permitted in development or when explicitly configured)
    const isProduction = process.env.NODE_ENV === 'production';
    const allowSeedLogins = process.env.ALLOW_DEV_SEED_LOGINS === 'true' || !isProduction;

    if (allowSeedLogins) {
      const seedUser = SEED_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      if (seedUser) {
        const match = await bcrypt.compare(password, seedUser.password_hash);
        if (match) {
          const { password_hash, ...safeUser } = seedUser;
          const token = this.signToken(safeUser);
          return { user: safeUser, token };
        }
      }
    } else {
      console.warn(`[AuthService] Seed fallback blocked in production mode for: ${cleanEmail}`);
    }

    throw new Error('Invalid email or password');
  }

  async getMe(userId) {
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data: user, error } = await supabase
          .from('aitag_users')
          .select('id, name, email, role, photo_url, created_at')
          .eq('id', userId)
          .single();

        if (!error && user) return user;
      }
    } catch (e) {}

    const seedUser = SEED_USERS.find(u => u.id === userId);
    if (seedUser) {
      const { password_hash, ...safeUser } = seedUser;
      return safeUser;
    }

    throw new Error('User not found');
  }

  async getAllUsers() {
    const isTest = (u) => {
      const email = (u.email || '').toLowerCase();
      const name = (u.name || '').toLowerCase();
      return (
        email.includes('del-neg') ||
        email.includes('aitag-test') ||
        email.includes('aitag-piet') ||
        name.includes('delete neg') ||
        name.includes('legit client')
      );
    };

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_users')
          .select('id, name, email, role, photo_url, created_at')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.filter(u => !isTest(u));
        }
      }
    } catch (e) {}

    return SEED_USERS
      .filter(u => !isTest(u))
      .map(({ password_hash, ...safeUser }) => safeUser);
  }

  /**
   * Public verified freelancer directory with ZERO PII (no emails, no client/admin accounts).
   */
  async getPublicFreelancerDirectory() {
    const users = await this.getAllUsers();
    const filtered = users.filter((u) => {
      if ((u.role || '').toLowerCase().trim() !== 'freelancer') return false;
      const cleanEmail = (u.email || '').toLowerCase().trim();
      const cleanName = (u.name || '').toLowerCase().trim();
      if (
        cleanEmail.includes('maqsood') ||
        cleanEmail.includes('maxmaqs') ||
        cleanName === 'maqs' ||
        cleanName.includes('maqsood') ||
        cleanEmail.includes('test') ||
        cleanName.includes('test')
      ) {
        return false;
      }
      return true;
    });

    const uniqueById = new Map();
    for (const u of filtered) {
      if (u.id && !uniqueById.has(u.id)) {
        uniqueById.set(u.id, {
          id: u.id,
          name: u.name || 'Verified Specialist',
          role: 'freelancer',
          photo_url: u.photo_url || '',
          created_at: u.created_at || null
        });
      }
    }
    return Array.from(uniqueById.values());
  }

  async resolveFreelancerById(userId) {
    if (!userId) return null;
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_users')
          .select('id, name, email, role')
          .eq('id', userId)
          .single();
        if (!error && data && data.role === 'freelancer') return data;
      }
    } catch {}

    const seed = SEED_USERS.find((u) => u.id === userId && u.role === 'freelancer');
    if (seed) {
      return { id: seed.id, name: seed.name, email: seed.email, role: seed.role };
    }
    return null;
  }

  deleteUserFromMemory(userId, email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const index = SEED_USERS.findIndex(
      (u) => (userId && u.id === userId) || (cleanEmail && u.email.toLowerCase() === cleanEmail)
    );
    if (index !== -1) {
      const removed = SEED_USERS.splice(index, 1);
      return removed[0];
    }
    return null;
  }

  /**
   * Request password reset link for user
   */
  async requestPasswordReset(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      throw new Error('Email is required');
    }

    // 1. Check if user exists (in Supabase or SEED_USERS)
    let userExists = false;
    let userName = 'AITAG User';

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data: user } = await supabase
          .from('aitag_users')
          .select('id, name, email')
          .eq('email', cleanEmail)
          .single();
        if (user) {
          userExists = true;
          userName = user.name || userName;
        }
      }
    } catch (e) {
      console.warn('[AuthService] Supabase check during password reset:', e.message);
    }

    if (!userExists) {
      const seedUser = SEED_USERS.find(u => u.email === cleanEmail);
      if (seedUser) {
        userExists = true;
        userName = seedUser.name || userName;
      }
    }

    // If user does not exist, return generic success message to prevent user enumeration
    if (!userExists) {
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      };
    }

    // 2. Generate cryptographically secure reset token
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    // Save hashed token
    PASSWORD_RESET_TOKENS.set(hashedToken, {
      email: cleanEmail,
      expiresAt
    });

    // 3. Build reset URL
    const baseUrl = process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:8000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    console.log(`🔑 [AuthService] Password reset token generated for ${cleanEmail}: ${resetUrl}`);

    // 4. Dispatch Email via SMTP
    const transporter = registrationNotifier.getTransporter();
    if (transporter) {
      try {
        const fromEmail = process.env.SMTP_FROM || 'AITAG Security <contact@aitag.in>';
        await transporter.sendMail({
          from: fromEmail,
          to: cleanEmail,
          subject: 'Reset your AITAG password',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #0f172a; margin: 0; font-size: 24px;">Password Reset Request</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 6px;">A password reset was requested for your AITAG account.</p>
              </div>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">Hello ${userName},</p>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.</p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #4f46e5, #0891b2); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5;">If the button doesn't work, copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a></p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">If you did not request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            </div>
          `
        });
        console.log(`✉️ [AuthService] Password reset email sent successfully to ${cleanEmail}`);
      } catch (err) {
        console.warn(`⚠️ [AuthService] Failed to send password reset email via SMTP: ${err.message}`);
      }
    }

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
      ...(process.env.NODE_ENV !== 'production' ? { devResetUrl: resetUrl } : {})
    };
  }

  validateNewPassword(newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error('Password must contain at least one uppercase letter (e.g. A-Z)');
    }
    const insecurePasswords = ['admin', 'password', '123456', 'qwerty', 'admin123', 'password123'];
    if (insecurePasswords.includes(newPassword.toLowerCase().trim())) {
      throw new Error('Password is too common or insecure. Please choose a stronger password.');
    }
  }

  /**
   * Update password for an authenticated user after verifying current password
   */
  async changePassword(userId, { currentPassword, newPassword }) {
    if (!currentPassword) {
      throw new Error('Current password is required');
    }
    this.validateNewPassword(newPassword);

    if (currentPassword === newPassword) {
      throw new Error('New password must be different from your current password');
    }

    let userRecord = null;
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data } = await supabase
          .from('aitag_users')
          .select('id, email, password_hash')
          .eq('id', userId)
          .maybeSingle();
        if (data) userRecord = data;
      }
    } catch (e) {
      console.warn('[AuthService] Supabase lookup during password change:', e.message);
    }

    if (!userRecord) {
      const seedUser = SEED_USERS.find((u) => u.id === userId);
      if (seedUser) userRecord = seedUser;
    }

    if (!userRecord || !userRecord.password_hash) {
      throw new Error('Account not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, userRecord.password_hash);
    if (!isMatch) {
      throw new Error('Current password is incorrect');
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    try {
      if (supabase && typeof supabase.from === 'function') {
        const { error } = await supabase
          .from('aitag_users')
          .update({ password_hash })
          .eq('id', userRecord.id);
        if (error) {
          console.warn('[AuthService] Supabase password update notice:', error.message);
        }
      }
    } catch (e) {
      console.warn('[AuthService] Supabase update error during password change:', e.message);
    }

    const seedUser = SEED_USERS.find((u) => u.id === userRecord.id || u.email === userRecord.email);
    if (seedUser) {
      seedUser.password_hash = password_hash;
    }

    return {
      success: true,
      message: 'Password updated successfully.'
    };
  }

  /**
   * Reset password with valid token
   */
  async resetPasswordWithToken({ token, newPassword }) {
    if (!token) {
      throw new Error('Reset token is required');
    }
    this.validateNewPassword(newPassword);

    // Verify token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const record = PASSWORD_RESET_TOKENS.get(hashedToken);

    if (!record || record.expiresAt < Date.now()) {
      if (record) PASSWORD_RESET_TOKENS.delete(hashedToken);
      throw new Error('This password reset link is invalid or has expired. Please request a new one.');
    }

    const { email } = record;
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update in Supabase
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { error } = await supabase
          .from('aitag_users')
          .update({ password_hash })
          .eq('email', email);
        if (error) {
          console.warn('[AuthService] Supabase password update notice:', error.message);
        }
      }
    } catch (e) {
      console.warn('[AuthService] Supabase update error during password reset:', e.message);
    }

    // Update in SEED_USERS
    const seedUser = SEED_USERS.find(u => u.email === email);
    if (seedUser) {
      seedUser.password_hash = password_hash;
    }

    // Invalidate token immediately (single-use)
    PASSWORD_RESET_TOKENS.delete(hashedToken);

    console.log(`✅ [AuthService] Password successfully reset for user: ${email}`);
    return {
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.'
    };
  }
}

module.exports = new AuthService();
