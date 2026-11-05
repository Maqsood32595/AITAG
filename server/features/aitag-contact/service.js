/**
 * AITAG Contact & Customer Support Service
 * Handles customer inquiries, server-side email dispatch, and audit persistence.
 */

const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const INQUIRIES_FILE = path.join(__dirname, '../../data/contact_inquiries.json');
const TARGET_EMAIL = process.env.CONTACT_RECEIVER_EMAIL || 'mohammedmaqsoodai@gmail.com';

// Ensure data directory and inquiries store exist
function getInquiriesStore() {
  try {
    if (!fs.existsSync(INQUIRIES_FILE)) {
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    const data = fs.readFileSync(INQUIRIES_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('⚠️ [Contact Service] Error reading inquiries store:', err.message);
    return [];
  }
}

function saveInquiryToStore(record) {
  try {
    const list = getInquiriesStore();
    list.unshift(record);
    // Keep last 1000 inquiries to prevent unbound growth
    if (list.length > 1000) list.length = 1000;
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ [Contact Service] Error writing inquiry to store:', err.message);
  }
}

/**
 * Send an email notification if SMTP is configured
 */
async function dispatchEmail(record) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const hasValidCredentials = user && pass && user !== 'your-email@gmail.com' && pass !== 'your-app-password';

  if (!hasValidCredentials) {
    console.log(`ℹ️ [Contact Service] Inquiry recorded from ${record.email} for [${record.serviceInterest}]. SMTP not configured; stored locally.`);
    return { dispatched: false, reason: 'smtp_not_configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'AITAG Platform'}" <${process.env.SMTP_FROM_EMAIL || user}>`,
      to: TARGET_EMAIL,
      replyTo: record.email,
      subject: `[AITAG Inquiry] ${record.serviceInterest}: ${record.subject || 'New Contact Request'}`,
      text: `New Contact Inquiry Received from AITAG Platform:
--------------------------------------------------
Name: ${record.name}
Email: ${record.email}
Phone: ${record.phone || 'Not provided'}
Service Interest: ${record.serviceInterest}
Subject: ${record.subject || 'None'}
Timestamp: ${record.timestamp}
IP Address: ${record.ip}

Message:
${record.message}
--------------------------------------------------
Reply directly to this email to respond to ${record.name} (${record.email}).
`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 16px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 20px; font-weight: 800;">AITAG Platform — New Customer Inquiry</h2>
            <p style="color: #64748b; margin: 4px 0 0; font-size: 13px;">Received on ${new Date(record.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })} (IST)</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569; width: 35%; border: 1px solid #e2e8f0;">Name:</td>
              <td style="padding: 8px 12px; color: #0f172a; border: 1px solid #e2e8f0;">${record.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Email:</td>
              <td style="padding: 8px 12px; color: #0f172a; border: 1px solid #e2e8f0;"><a href="mailto:${record.email}" style="color: #2563eb; font-weight: 600;">${record.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Phone / WhatsApp:</td>
              <td style="padding: 8px 12px; color: #0f172a; border: 1px solid #e2e8f0;">${record.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Service Interest:</td>
              <td style="padding: 8px 12px; color: #4f46e5; font-weight: 700; border: 1px solid #e2e8f0;">${record.serviceInterest}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; background: #f8fafc; font-weight: 600; color: #475569; border: 1px solid #e2e8f0;">Subject:</td>
              <td style="padding: 8px 12px; color: #0f172a; border: 1px solid #e2e8f0;">${record.subject || 'General Inquiry'}</td>
            </tr>
          </table>

          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-weight: 700; color: #0f172a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message Content:</p>
            <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${record.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; font-size: 12px; color: #94a3b8; text-align: center;">
            <p style="margin: 0;">Click "Reply" to respond directly to the client at <strong>${record.email}</strong>.</p>
            <p style="margin: 4px 0 0;">Inquiry Reference ID: <code>${record.id}</code></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [Contact Service] Email successfully sent to ${TARGET_EMAIL}:`, info.messageId);
    return { dispatched: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ [Contact Service] Failed to send email via SMTP:', err.message);
    return { dispatched: false, error: err.message };
  }
}

/**
 * Process a new contact inquiry
 */
async function processInquiry({ name, email, phone, serviceInterest, subject, message, ip }) {
  const record = {
    id: `inq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: (phone || '').trim(),
    serviceInterest: (serviceInterest || 'General Inquiry').trim(),
    subject: (subject || '').trim() || `${serviceInterest || 'Inquiry'} from ${name.trim()}`,
    message: message.trim(),
    ip: ip || 'unknown',
    status: 'recorded'
  };

  saveInquiryToStore(record);

  // Attempt email delivery in the background (non-blocking)
  const deliveryResult = await dispatchEmail(record);
  record.delivery = deliveryResult;

  return {
    success: true,
    inquiryId: record.id,
    message: 'Your inquiry has been successfully received. Our team will get back to you within 24 hours.'
  };
}

module.exports = {
  processInquiry,
  getInquiriesStore
};

