/**
 * AITAG New User Registration & Welcome Notifier
 * Automatically dispatches:
 * 1. Real-time internal ops alert to contact@aitag.in
 * 2. Role-aware welcome email to the newly registered user (Client vs Specialist)
 *    Templates loaded dynamically from workflows/welcome_email_templates.js
 */

const nodemailer = require('nodemailer');
const path = require('path');

let renderWelcomeEmail;
try {
  ({ renderWelcomeEmail } = require('../../../../../workflows/welcome_email_templates'));
} catch (err) {
  try {
    const fallbackPath = path.join(process.cwd(), 'workflows/welcome_email_templates');
    ({ renderWelcomeEmail } = require(fallbackPath));
  } catch (err2) {
    console.warn('⚠️ [RegistrationNotifier] Could not load workflows/welcome_email_templates, using safe fallback:', err2.message);
    renderWelcomeEmail = (user) => ({
      subject: 'Welcome to AITAG — Find AI Skills, Get It Done 🚀',
      text: `Hi ${user.name || 'there'},\n\nWelcome to AITAG! Find AI skills and get work done at https://aitag.in`,
      html: `<p>Hi ${user.name || 'there'},</p><p>Welcome to AITAG! Find AI skills and get work done at <a href="https://aitag.in">aitag.in</a>.</p>`
    });
  }
}

function isTestContext(user) {
  if (process.env.NODE_ENV === 'test' || process.env.PIET_RUN === 'true') return true;
  if (user && user.email) {
    const e = user.email.toLowerCase();
    if (e.includes('aitag-test') || e.includes('aitag-piet') || e.endsWith('.local') || e.includes('test-user') || e.includes('example.com')) {
      return true;
    }
  }
  if (user && user.name && (user.name.toLowerCase().includes('test') || user.name.toLowerCase().includes('piet'))) {
    return true;
  }
  return false;
}

class RegistrationNotifier {
  constructor() {
    this.targetEmail = process.env.REGISTRATION_ALERT_EMAIL || 'contact@aitag.in';
  }

  /**
   * Helper to create verified SMTP transport
   */
  getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.resend.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const hasValidCredentials = smtpUser && smtpPass && smtpUser !== 'your-email@gmail.com' && smtpPass !== 'your-app-password';

    if (!hasValidCredentials) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass }
    });
  }

  /**
   * Dispatches branded welcome email to the newly registered user
   * Content is managed dynamically in workflows/welcome_email_templates.js
   * @param {Object} params
   * @param {Object} params.user - { id, name, email, role }
   */
  async sendWelcomeEmail({ user }) {
    if (isTestContext(user)) {
      return { dispatched: false, reason: 'test_environment' };
    }

    if (!user || !user.email) {
      return { dispatched: false, reason: 'missing_user_email' };
    }

    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log(`ℹ️ [RegistrationNotifier] Welcome email skipped for ${user.email}: SMTP credentials not configured.`);
        return { dispatched: false, reason: 'smtp_not_configured' };
      }

      const { subject, text, html } = renderWelcomeEmail(user);
      const fromAddress = process.env.SMTP_FROM_EMAIL || 'notifications@aitag.in';
      const fromName = process.env.SMTP_FROM_NAME || 'AITAG Platform';
      const replyTo = process.env.CONTACT_RECEIVER_EMAIL || 'contact@aitag.in';

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: user.email,
        replyTo,
        subject,
        text,
        html
      });

      console.log(`✅ [RegistrationNotifier] Welcome email delivered to ${user.email} (Message ID: ${info.messageId})`);
      return { dispatched: true, messageId: info.messageId };
    } catch (err) {
      console.error(`⚠️ [RegistrationNotifier] Failed to send welcome email to ${user.email}:`, err.message);
      return { dispatched: false, error: err.message };
    }
  }

  /**
   * Dispatches email alert to contact@aitag.in AND welcome email to user (non-blocking)
   * @param {Object} params
   * @param {Object} params.user - { id, name, email, role, created_at, photo_url }
   * @param {string} params.method - 'Manual Registration (Email/Password)' or 'Google OAuth (Single Sign-On)'
   */
  async notifyNewUserRegistration({ user, method }) {
    // 1. Silent skip during automated unit/integration test suites
    if (isTestContext(user)) {
      return { dispatched: false, reason: 'test_environment' };
    }

    // 2. Dispatch the Welcome Email to the new user in parallel
    this.sendWelcomeEmail({ user }).catch(err => {
      console.warn(`⚠️ [RegistrationNotifier] Welcome email background dispatch warning:`, err.message);
    });

    // 3. Dispatch the Internal Admin Alert to contact@aitag.in
    try {
      const transporter = this.getTransporter();
      if (!transporter) {
        console.log(`ℹ️ [RegistrationNotifier] New user registered (${user.email} via ${method}). SMTP not configured; skipping email dispatch.`);
        return { dispatched: false, reason: 'smtp_not_configured' };
      }

      const roleDisplay = user.role === 'freelancer' ? 'AI Specialist / Freelancer' : 'Client / Small Business';
      const formattedDate = new Date(user.created_at || Date.now()).toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'medium'
      }) + ' (IST)';

      const subject = `[AITAG Alert] 🎉 New User Registered: ${user.name || user.email} (${roleDisplay})`;

      const plainText = `A new user has registered on the AITAG Platform:
--------------------------------------------------
Name: ${user.name || 'Not provided'}
Email: ${user.email}
Role: ${roleDisplay}
Signup Method: ${method}
User ID: ${user.id}
Registration Time: ${formattedDate}
--------------------------------------------------
View user management at: https://aitag.in/admin
`;

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800;">🎉 New User Registration</h2>
            <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">AITAG Platform Notification • ${formattedDate}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #475569; width: 35%; border: 1px solid #e2e8f0;">Full Name:</td>
              <td style="padding: 10px 14px; color: #0f172a; font-weight: 700; border: 1px solid #e2e8f0;">${user.name || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Email Address:</td>
              <td style="padding: 10px 14px; color: #0f172a; border: 1px solid #e2e8f0;">
                <a href="mailto:${user.email}" style="color: #2563eb; font-weight: 600; text-decoration: none;">${user.email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Account Role:</td>
              <td style="padding: 10px 14px; color: #0f172a; border: 1px solid #e2e8f0;">
                <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; ${user.role === 'freelancer' ? 'background: #fdf2f8; color: #be185d; border: 1px solid #fbcfe8;' : 'background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;'}">
                  ${roleDisplay}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Registration Method:</td>
              <td style="padding: 10px 14px; color: #0f172a; border: 1px solid #e2e8f0;">
                <strong>${method}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">User ID:</td>
              <td style="padding: 10px 14px; color: #64748b; font-family: monospace; font-size: 12px; border: 1px solid #e2e8f0;">${user.id}</td>
            </tr>
            <tr>
              <td style="padding: 10px 14px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Timestamp:</td>
              <td style="padding: 10px 14px; color: #475569; font-size: 13px; border: 1px solid #e2e8f0;">${formattedDate}</td>
            </tr>
          </table>

          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #64748b;">
              This is an automated operational alert dispatched to <strong>${this.targetEmail}</strong>.
            </p>
          </div>
        </div>
      `;

      const fromAddress = process.env.SMTP_FROM_EMAIL || 'notifications@aitag.in';
      const fromName = process.env.SMTP_FROM_NAME || 'AITAG Platform';

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: this.targetEmail,
        replyTo: user.email,
        subject,
        text: plainText,
        html
      });

      console.log(`✅ [RegistrationNotifier] Alert dispatched to ${this.targetEmail} for new user ${user.email} (Message ID: ${info.messageId})`);
      return { dispatched: true, messageId: info.messageId };
    } catch (err) {
      console.error(`⚠️ [RegistrationNotifier] Failed to dispatch registration alert:`, err.message);
      return { dispatched: false, error: err.message };
    }
  }
}

module.exports = new RegistrationNotifier();
