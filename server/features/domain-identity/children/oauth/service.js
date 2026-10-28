/**
 * AITAG Google OAuth & Social Auth Service
 * Fractal Kernel Slice: aitag-oauth
 * ==============================================================================
 * Handles Google OAuth 2.0 credential verification, seamless Gmail registration,
 * role assignment (AI Expert vs Client), and session token issuance.
 */

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('../../../../supabase');
const authService = require('../auth/service');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '146304368488-snstqv6tulh315kh4gep22verk8gm1pe.apps.googleusercontent.com';

class GoogleOAuthService {
  constructor() {
    this.clientId = GOOGLE_CLIENT_ID;
    this.client = new OAuth2Client(this.clientId);
  }

  /**
   * Verifies Google JWT ID token from Google Identity Services
   */
  async verifyGoogleToken(idToken) {
    if (!idToken) {
      throw new Error('Google credential token is required');
    }

    // PIET & Test Environment bypass hook for zero-mock test runs
    if (process.env.NODE_ENV === 'test' && idToken.startsWith('piet-test-token:')) {
      const parts = idToken.split(':');
      const testEmail = parts[1] || 'test-user@gmail.com';
      return {
        email: testEmail.toLowerCase().trim(),
        name: 'PIET Verified Google User',
        picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
        email_verified: true,
        sub: `google-sub-${Date.now()}`
      };
    }

    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.clientId
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new Error('Invalid token payload received from Google');
      }

      if (!payload.email_verified) {
        throw new Error('Google account email is not verified');
      }

      return {
        email: payload.email.toLowerCase().trim(),
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || '',
        email_verified: payload.email_verified,
        sub: payload.sub
      };
    } catch (err) {
      throw new Error(`Google token verification failed: ${err.message}`);
    }
  }

  /**
   * Unified Login & Registration with Gmail
   * Automatically signs in existing users, or creates a new user account with selected role.
   */
  async authenticateGoogleUser({ credential, role }) {
    const googleProfile = await this.verifyGoogleToken(credential);
    const email = googleProfile.email;

    // Strict role check for new registrations: only 'client' or 'freelancer' (AI Expert)
    const ALLOWED_ROLES = ['client', 'freelancer'];
    const safeRole = (role && ALLOWED_ROLES.includes(role.toLowerCase().trim()))
      ? role.toLowerCase().trim()
      : 'client'; // Default to client if not specified

    // 1. Check if user already exists in Supabase
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data: existingUser } = await supabase
          .from('aitag_users')
          .select('id, name, email, role, photo_url, created_at')
          .eq('email', email)
          .maybeSingle();

        if (existingUser) {
          // If existing user lacks avatar, enrich with Google picture
          if (!existingUser.photo_url && googleProfile.picture) {
            await supabase
              .from('aitag_users')
              .update({ photo_url: googleProfile.picture })
              .eq('id', existingUser.id);
            existingUser.photo_url = googleProfile.picture;
          }

          const token = authService.signToken(existingUser);
          return {
            user: existingUser,
            token,
            isNew: false
          };
        }

        // User does not exist -> Register new Gmail user
        const dummyPassword = crypto.randomBytes(32).toString('hex');
        const password_hash = await bcrypt.hash(dummyPassword, 10);
        const photo_url = googleProfile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleProfile.name)}`;

        const { data: newUser, error: insertError } = await supabase
          .from('aitag_users')
          .insert([{
            name: googleProfile.name,
            email,
            password_hash,
            photo_url,
            role: safeRole
          }])
          .select('id, name, email, role, photo_url, created_at')
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        // If registered as AI Expert (freelancer), provision empty profile entry
        if (safeRole === 'freelancer') {
          try {
            await supabase.from('aitag_profiles').insert([{
              user_id: newUser.id,
              user_email: newUser.email,
              headline: 'AI Solutions Specialist',
              bio: `Delivering production AI workflows and generative services.`,
              hourly_rate: 0,
              skills: ['AI Visuals', 'Prompt Engineering']
            }]);
          } catch (profileErr) {
            console.warn('[GoogleOAuthService] Default profile creation note:', profileErr.message);
          }
        }

        const token = authService.signToken(newUser);
        return {
          user: newUser,
          token,
          isNew: true
        };
      }
    } catch (dbErr) {
      console.warn('[GoogleOAuthService] Supabase query fallback:', dbErr.message);
    }

    // 2. Resilient In-Memory Fallback
    const existingMemoryUser = authService.findInMemoryUser ? authService.findInMemoryUser(email) : null;
    if (existingMemoryUser) {
      const { password_hash: _, ...safeUser } = existingMemoryUser;
      const token = authService.signToken(safeUser);
      return { user: safeUser, token, isNew: false };
    }

    // In-memory registration
    const fallbackUser = {
      id: `google-${Date.now()}`,
      name: googleProfile.name,
      email,
      role: safeRole,
      photo_url: googleProfile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleProfile.name)}`,
      created_at: new Date().toISOString()
    };

    const token = authService.signToken(fallbackUser);
    return {
      user: fallbackUser,
      token,
      isNew: true
    };
  }

  /**
   * Returns public OAuth configuration for client initialization
   */
  getPublicConfig() {
    return {
      success: true,
      service: 'aitag-oauth',
      clientId: this.clientId,
      supportedProviders: ['google'],
      status: 'active'
    };
  }
}

module.exports = new GoogleOAuthService();
