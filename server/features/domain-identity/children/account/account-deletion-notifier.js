/**
 * AITAG Account Deletion & Exit Feedback Notifier
 * Automatically dispatches:
 * 1. Confirmation & feedback request email to the departing user
 *    (Templates loaded from workflows/account_deletion_feedback_templates.js)
 * 2. Operational notice to contact@aitag.in
 */

const nodemailer = require('nodemailer');
const path = require('path');

let renderAccountDeletionFeedbackEmail;
try {
  ({ renderAccountDeletionFeedbackEmail } = require('../../../../../workflows/account_deletion_feedback_templates'));
} catch (err) {
  try {
    const fallbackPath = path.join(process.cwd(), 'workflows/account_deletion_feedback_templates');
    ({ renderAccountDeletionFeedbackEmail } = require(fallbackPath));
  } catch (err2) {
    console.warn('⚠️ [AccountDeletionNotifier] Could not load workflows/account_deletion_feedback_templates, using safe fallback:', err2.message);
    renderAccountDeletionFeedbackEmail = (user) => ({
      subject: 'Account Deleted | AITAG',
      text: `Hi ${user.name || 'there'},\n\nYour account has been deleted. Reply with any feedback.`,
      html: `<p>Hi ${user.name || 'there'},</p><p>Your account has been deleted. Reply with any feedback.</p>`
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

class AccountDeletionNotifier {
  constructor() {
    this.targetAdminEmail = process.env.REGISTRATION_ALERT_EMAIL || 'contact@aitag.in';
  }

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
   * Dispatches account deletion confirmation and feedback request to the user
   * @param {Object} params
   * @param {Object} params.user - { id, name, email, role }
   */
  async notifyAccountDeleted({ user }) {
    if (isTestContext(user)) {
      return { dispatched: false, reason: 'test_environment' };
    }

    if (!user || !user.email) {
      return { dispatched: false, reason: 'missing_user_email' };
    }

    const transporter = this.getTransporter();
    if (!transporter) {
      console.log(`ℹ️ [AccountDeletionNotifier] Deletion email skipped for ${user.email}: SMTP credentials not configured.`);
      return { dispatched: false, reason: 'smtp_not_configured' };
    }

    const fromAddress = process.env.SMTP_FROM_EMAIL || 'notifications@aitag.in';
    const fromName = process.env.SMTP_FROM_NAME || 'AITAG Platform';
    const replyTo = process.env.CONTACT_RECEIVER_EMAIL || 'contact@aitag.in';

    // 1. Send confirmation & feedback email to departing user
    try {
      const { subject, text, html } = renderAccountDeletionFeedbackEmail(user);

      const userEmailInfo = await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: user.email,
        replyTo,
        subject,
        text,
        html
      });

      console.log(`✅ [AccountDeletionNotifier] Deletion confirmation & feedback email delivered to ${user.email} (Message ID: ${userEmailInfo.messageId})`);
    } catch (err) {
      console.error(`⚠️ [AccountDeletionNotifier] Failed to send deletion email to ${user.email}:`, err.message);
    }

    // 2. Send internal ops notice to contact@aitag.in
    try {
      await transporter.sendMail({
        from: `"${fromName}" <${fromAddress}>`,
        to: this.targetAdminEmail,
        subject: `[AITAG Notice] Account Deleted: ${user.name || user.email} (${user.role || 'client'})`,
        text: `A user has deleted their account on the AITAG Platform:
--------------------------------------------------
User Name: ${user.name || 'Not provided'}
Email: ${user.email}
Account Role: ${user.role || 'client'}
User ID: ${user.id}
Timestamp: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)
--------------------------------------------------
An exit feedback request has been delivered to their email address.
`
      });
    } catch (adminErr) {
      console.warn(`⚠️ [AccountDeletionNotifier] Failed to send admin notice for deleted account:`, adminErr.message);
    }

    return { dispatched: true };
  }
}

module.exports = new AccountDeletionNotifier();
