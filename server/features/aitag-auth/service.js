/**
 * AITAG Auth Service — Supabase-backed JWT auth
 * Fractal Kernel Slice: aitag-auth
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../../supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'aitag-fractal-kernel-jwt-secret-2026';
const JWT_EXPIRES = '7d';

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
    // Check if email already exists
    const { data: existing } = await supabase
      .from('aitag_users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      throw new Error('Email already registered');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('aitag_users')
      .insert([{
        name,
        email,
        password_hash,
        photo_url: photoURL || '',
        role: role || 'freelancer'
      }])
      .select('id, name, email, role, photo_url, created_at')
      .single();

    if (error) throw new Error(error.message);

    const token = this.signToken(user);
    return { user, token };
  }

  async login({ email, password }) {
    const { data: user, error } = await supabase
      .from('aitag_users')
      .select('id, name, email, password_hash, role, photo_url, created_at')
      .eq('email', email)
      .single();

    if (error || !user) throw new Error('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) throw new Error('Invalid email or password');

    const { password_hash, ...safeUser } = user;
    const token = this.signToken(safeUser);
    return { user: safeUser, token };
  }

  async getMe(userId) {
    const { data: user, error } = await supabase
      .from('aitag_users')
      .select('id, name, email, role, photo_url, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) throw new Error('User not found');
    return user;
  }

  async getAllUsers() {
    const { data, error } = await supabase
      .from('aitag_users')
      .select('id, name, email, role, photo_url, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
}

module.exports = new AuthService();
