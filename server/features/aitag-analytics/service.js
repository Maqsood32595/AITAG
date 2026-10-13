/**
 * AITAG Analytics & User Dossier Orchestration Service
 * Fractal Kernel Slice: aitag-analytics
 * Grandchild Architecture Coordinator
 */

const supabase = require('../../supabase');
const ordersService = require('../aitag-service-orders/service');
const tasksService = require('../aitag-tasks/service');
const profileService = require('../aitag-profile/service');
const { computeClientAnalytics } = require('./aggregators/client-analytics');
const { computeFreelancerAnalytics } = require('./aggregators/freelancer-analytics');
const { computeAdminAnalytics } = require('./aggregators/admin-analytics');
const { buildUserDossier } = require('./aggregators/dossier-builder');

class AnalyticsService {
  /**
   * Fetches full analytics & dossier for the authenticated user
   */
  async getUserAnalyticsAndDossier(user) {
    if (!user || !user.email) {
      throw new Error('User context is required');
    }

    const role = user.role || 'client';
    const email = user.email.toLowerCase();

    // 1. Gather Orders
    let orders = [];
    try {
      if (role === 'admin') {
        orders = await ordersService.listOrders({});
      } else if (role === 'client') {
        orders = await ordersService.listOrders({ role: 'client', email });
      } else {
        orders = await ordersService.listOrders({ role: 'freelancer', email });
      }
    } catch (e) {
      console.warn('⚠️ Analytics orders fetch fallback:', e.message);
      orders = [];
    }

    // 2. Gather Tasks
    let tasks = [];
    try {
      if (role === 'admin') {
        tasks = await tasksService.getAllTasks({ limit: 100 });
      } else if (role === 'client') {
        tasks = await tasksService.getMyTasks(email);
      } else {
        // Freelancers see tasks they bid on or featured
        tasks = await tasksService.getFeaturedTasks();
      }
    } catch (e) {
      console.warn('⚠️ Analytics tasks fetch fallback:', e.message);
      tasks = [];
    }

    // 3. Gather Bids
    let bids = [];
    try {
      if (supabase && typeof supabase.from === 'function') {
        let q = supabase.from('aitag_bids').select('*');
        if (role === 'client') {
          q = q.eq('task_owner_email', email);
        } else if (role === 'freelancer') {
          q = q.eq('user_email', email);
        }
        const { data } = await q;
        if (data) bids = data;
      }
    } catch (e) {
      console.warn('⚠️ Analytics bids fetch fallback:', e.message);
      bids = [];
    }

    // 4. Gather Invitations
    let invitations = [];
    try {
      if (supabase && typeof supabase.from === 'function') {
        let q = supabase.from('aitag_invitations').select('*');
        if (role === 'client') {
          q = q.eq('client_email', email);
        } else if (role === 'freelancer') {
          q = q.eq('freelancer_email', email);
        }
        const { data } = await q;
        if (data) invitations = data;
      }
    } catch (e) {
      console.warn('⚠️ Analytics invitations fetch fallback:', e.message);
      invitations = [];
    }

    // 5. Gather Profile
    let profile = {};
    try {
      if (user.id) {
        profile = (await profileService.getProfileByUserId(user.id)) || {};
      }
    } catch {
      profile = {};
    }

    // 6. Gather Users (for Admin only)
    let allUsers = [];
    if (role === 'admin') {
      try {
        if (supabase && typeof supabase.from === 'function') {
          const { data } = await supabase.from('aitag_users').select('id, name, email, role, created_at');
          if (data) allUsers = data;
        }
      } catch {
        allUsers = [user];
      }
    }

    // 7. Delegate to Grandchild Domain Engines
    let roleAnalytics = {};
    if (role === 'admin') {
      roleAnalytics = computeAdminAnalytics({ orders, tasks, users: allUsers, bids });
    } else if (role === 'freelancer') {
      roleAnalytics = computeFreelancerAnalytics({ user, orders, bids, invitations, profile });
    } else {
      roleAnalytics = computeClientAnalytics({ user, orders, tasks, bids, invitations });
    }

    // 8. Build Complete User Dossier & Lifetime Activity Ledger
    const dossier = buildUserDossier({ user, profile, orders, tasks, bids, invitations });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo_url: user.photo_url
      },
      analytics: roleAnalytics,
      dossier,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new AnalyticsService();
