/**
 * AITAG Expert Applications & Onboarding Service
 * Coordinates specialist applications, 1-week training orientation,
 * and admin approval/verification workflow.
 */

const fs = require('fs');
const path = require('path');
const supabase = require('../../../../supabase');
const nodemailer = require('nodemailer');

const APPLICATIONS_FILE = path.join(__dirname, '../../../../data/expert_applications.json');
const TARGET_ADMIN_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || 'mohammedmaqsoodai@gmail.com';

function getApplicationsStore() {
  try {
    if (!fs.existsSync(APPLICATIONS_FILE)) {
      fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('⚠️ [ExpertApplicationsService] Error reading store:', err.message);
    return [];
  }
}

function saveApplicationsStore(list) {
  try {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ [ExpertApplicationsService] Error writing store:', err.message);
  }
}

class ExpertApplicationsService {
  /**
   * Submit an expert application for 1-week training & evaluation
   */
  async submitApplication({ name, email, phone, domain, tools, portfolio_url, experience, bio, userId }) {
    if (!name || !name.trim()) throw new Error('Name is required');
    if (!email || !email.trim()) throw new Error('Valid email address is required');
    if (!portfolio_url || !portfolio_url.trim()) throw new Error('Portfolio or work samples URL is required');

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = (phone || '').trim();
    const cleanDomain = (domain || 'AI Product Photography & Visuals').trim();
    const cleanTools = Array.isArray(tools) ? tools.join(', ') : (tools || 'Midjourney, Claude, GPT-4').trim();
    const cleanPortfolio = portfolio_url.trim();
    const cleanBio = (bio || experience || '').trim();

    const record = {
      id: `app_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId || null,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      domain: cleanDomain,
      tools: cleanTools,
      portfolio_url: cleanPortfolio,
      bio: cleanBio,
      experience_level: experience || '1-3 years with generative AI',
      status: 'pending', // 'pending' | 'under_evaluation' | 'approved' | 'rejected'
      notes: '',
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 1. Persist locally to resilient store
    const list = getApplicationsStore();
    // Check if an application already exists for this email
    const existingIndex = list.findIndex(a => a.email === cleanEmail && a.status === 'pending');
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...record, id: list[existingIndex].id, updated_at: new Date().toISOString() };
    } else {
      list.unshift(record);
    }
    saveApplicationsStore(list);

    // 2. Attempt Supabase persistence (non-blocking fallback)
    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase
          .from('aitag_expert_applications')
          .upsert([{
            id: record.id,
            name: record.name,
            email: record.email,
            phone: record.phone,
            domain: record.domain,
            tools: record.tools,
            portfolio_url: record.portfolio_url,
            bio: record.bio,
            status: record.status,
            created_at: record.created_at
          }]);
      }
    } catch (e) {
      // Table may not exist yet in dev; file store guarantees persistence
    }

    // 3. Send notification email if SMTP configured
    this.sendNotificationEmail(record).catch(() => {});

    return {
      success: true,
      applicationId: record.id,
      message: 'Application received. Our team will review your work samples and schedule your 1-week training orientation.'
    };
  }

  /**
   * List all applications (Admin only)
   */
  async listApplications() {
    // Read from local store
    let localList = getApplicationsStore();

    // Try Supabase sync if available
    try {
      if (supabase && typeof supabase.from === 'function') {
        const { data, error } = await supabase
          .from('aitag_expert_applications')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch {}

    return localList;
  }

  /**
   * Evaluate / Approve / Reject an application (Admin only)
   */
  async evaluateApplication({ applicationId, status, notes, adminEmail }) {
    if (!['approved', 'rejected', 'under_evaluation', 'pending'].includes(status)) {
      throw new Error('Invalid status. Must be approved, rejected, or under_evaluation');
    }

    const list = getApplicationsStore();
    const appIndex = list.findIndex(a => a.id === applicationId);
    if (appIndex === -1) {
      throw new Error('Application not found');
    }

    const application = list[appIndex];
    application.status = status;
    application.notes = notes || application.notes || '';
    application.reviewed_by = adminEmail || 'admin';
    application.reviewed_at = new Date().toISOString();
    application.updated_at = new Date().toISOString();

    list[appIndex] = application;
    saveApplicationsStore(list);

    // If status is 'approved', promote the user to 'freelancer' and activate verified specialist status
    if (status === 'approved') {
      await this.promoteUserToVerifiedSpecialist(application);
    }

    // Sync to Supabase if configured
    try {
      if (supabase && typeof supabase.from === 'function') {
        await supabase
          .from('aitag_expert_applications')
          .update({
            status: application.status,
            notes: application.notes,
            reviewed_by: application.reviewed_by,
            reviewed_at: application.reviewed_at
          })
          .eq('id', applicationId);
      }
    } catch {}

    return {
      success: true,
      application
    };
  }

  /**
   * Promotes an approved applicant user to 'freelancer' role with verified profile
   */
  async promoteUserToVerifiedSpecialist(application) {
    try {
      // 1. Update in Supabase aitag_users
      if (supabase && typeof supabase.from === 'function') {
        const { data: user } = await supabase
          .from('aitag_users')
          .select('id, email, name, role')
          .eq('email', application.email)
          .maybeSingle();

        if (user) {
          // Promote role to freelancer
          await supabase
            .from('aitag_users')
            .update({ role: 'freelancer' })
            .eq('id', user.id);

          // Create or update verified profile
          await supabase
            .from('aitag_profiles')
            .upsert([{
              user_id: user.id,
              user_email: user.email,
              headline: `${application.domain} Specialist`,
              bio: application.bio || 'Verified AITAG AI Solutions Specialist.',
              skills: application.tools ? application.tools.split(',').map(s => s.trim()) : ['Midjourney', 'Claude', 'GPT-4'],
              verified: true,
              portfolio: application.portfolio_url ? [{ title: 'Specialist Portfolio', url: application.portfolio_url }] : []
            }]);
          
          console.log(`✅ [ExpertApplications] Promoted ${user.email} to verified freelancer!`);
        }
      }
    } catch (err) {
      console.warn('⚠️ [ExpertApplications] Error promoting user in database:', err.message);
    }
  }

  async sendNotificationEmail(record) {
    try {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!user || !pass || user === 'your-email@gmail.com') return;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
      });

      await transporter.sendMail({
        from: `"AITAG Applications" <${user}>`,
        to: TARGET_ADMIN_EMAIL,
        subject: `[AITAG Specialist Application] ${record.name} (${record.domain})`,
        text: `New 1-Week Training Application:\n\nName: ${record.name}\nEmail: ${record.email}\nPhone: ${record.phone}\nDomain: ${record.domain}\nTools: ${record.tools}\nPortfolio: ${record.portfolio_url}\nBio: ${record.bio}`
      });
    } catch (e) {
      // Non-fatal
    }
  }
}

module.exports = new ExpertApplicationsService();

