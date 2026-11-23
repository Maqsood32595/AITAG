/**
 * AITAG New User Welcome Email Templates & Workflow Configuration
 * Location: workflows/welcome_email_templates.js
 * 
 * ==============================================================================
 * EDITING INSTRUCTIONS:
 * When you want to modify the welcome email message, wording, links, or styling,
 * simply edit the text strings in this file. Changes will immediately reflect in
 * both manual signup and Google OAuth welcome dispatches.
 * ==============================================================================
 */

const WELCOME_TEMPLATES = {
  // --------------------------------------------------------------------------
  // CLIENT TRACK: Small Business Owners & Everyday Entrepreneurs
  // --------------------------------------------------------------------------
  client: {
    subject: 'Welcome to AITAG — Find AI Skills, Get It Done 🚀',
    previewText: 'Welcome to AITAG. Explore AI launch packages or post your custom requirement today.',
    headline: 'Welcome to AITAG!',
    subheadline: 'Find AI Skills. Get Business Results Fast.',
    greeting: (name) => `Hi ${name || 'there'},`,
    intro: 'Welcome to AITAG — India’s trusted marketplace connecting everyday entrepreneurs and small business owners with vetted AI specialists.',
    keyPointsTitle: 'Three easy ways to get started right now:',
    keyPoints: [
      {
        emoji: '📦',
        title: 'Explore Ready-to-Order AI Packages',
        description: 'From AI Product Photos (from ₹999) to Promo Reels (from ₹1,499) and Fast Websites (from ₹1,999) — transparent pricing with revision rounds included.'
      },
      {
        emoji: '📝',
        title: 'Post a Custom Business Requirement',
        description: 'Have a unique deliverable in mind? Post your brief in minutes and receive proposals from vetted specialists.'
      },
      {
        emoji: '🛡️',
        title: '100% Escrow Safety Guarantee',
        description: 'Your payment stays safely locked in escrow and is only disbursed to the specialist once you approve the final output.'
      }
    ],
    ctaText: 'Explore Service Packages',
    ctaUrl: 'https://aitag.in/#packages',
    supportNote: 'Have questions or need help scoping your project? Reply directly to this email or reach us on WhatsApp at +91 98860 31643.'
  },

  // --------------------------------------------------------------------------
  // FREELANCER TRACK: AI Specialists, Prompt Engineers & Creators
  // --------------------------------------------------------------------------
  freelancer: {
    subject: 'Welcome to AITAG Creator Community — Start Delivering AI Work 🎨',
    previewText: 'Welcome to the AITAG specialist network. Complete your profile and start earning.',
    headline: 'Welcome to the AITAG Creator Community!',
    subheadline: 'Deliver Commercial AI Deliverables. Keep 80% Earnings.',
    greeting: (name) => `Hi ${name || 'there'},`,
    intro: 'Welcome to AITAG! You are now part of a curated community of verified AI creators, developers, and prompt engineers delivering real-world business outcomes.',
    keyPointsTitle: 'Three next steps to start earning on AITAG:',
    keyPoints: [
      {
        emoji: '✨',
        title: 'Complete Your Specialist Profile',
        description: 'List the cutting-edge AI tools you use (Flux.1, Midjourney, Kling AI, Runway Gen-3, ElevenLabs, Cursor) and showcase your portfolio samples.'
      },
      {
        emoji: '🔍',
        title: 'Browse Live Marketplace Requirements',
        description: 'Explore client tasks across product photos, marketing reels, web development, and branding. Zero bidding fees.'
      },
      {
        emoji: '⚡',
        title: 'Fair Play & Fast 24-Hour Payouts',
        description: 'You take home 80% of project value with guaranteed 24-hour payouts via UPI or direct bank transfer upon client sign-off.'
      }
    ],
    ctaText: 'Complete Your Specialist Profile',
    ctaUrl: 'https://aitag.in/profile',
    supportNote: 'Need help optimizing your profile or have questions about client payouts? Reply directly to this email or contact support at contact@aitag.in.'
  }
};

/**
 * Generates Subject, Plain Text, and Responsive HTML for a new user welcome email
 * @param {Object} user - { name, email, role }
 * @returns {Object} { subject, text, html }
 */
function renderWelcomeEmail(user) {
  const isFreelancer = (user.role || '').toLowerCase().trim() === 'freelancer';
  const template = isFreelancer ? WELCOME_TEMPLATES.freelancer : WELCOME_TEMPLATES.client;
  const userName = (user.name || user.email.split('@')[0] || '').trim();

  const plainText = `${template.greeting(userName)}

${template.intro}

${template.keyPointsTitle}
${template.keyPoints.map((kp, idx) => `${idx + 1}. ${kp.title}: ${kp.description}`).join('\n')}

Get started: ${template.ctaUrl}

${template.supportNote}

Warm regards,
The AITAG Team
https://aitag.in
`;

  const keyPointsHtml = template.keyPoints.map(kp => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%;">
          <tr>
            <td style="width: 38px; vertical-align: top; font-size: 24px; line-height: 1;">
              ${kp.emoji}
            </td>
            <td style="vertical-align: top; padding-left: 10px;">
              <strong style="color: #0f172a; font-size: 15px; display: block; margin-bottom: 3px;">
                ${kp.title}
              </strong>
              <span style="color: #64748b; font-size: 13.5px; line-height: 1.5; display: block;">
                ${kp.description}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${template.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f8fafc; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);">
              
              <!-- Header Gradient Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 32px 30px; text-align: left;">
                  <div style="font-size: 12px; font-weight: 800; color: #93c5fd; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                    ✦ AITAG PLATFORM
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; line-height: 1.3;">
                    ${template.headline}
                  </h1>
                  <p style="margin: 6px 0 0; color: #e0e7ff; font-size: 14px;">
                    ${template.subheadline}
                  </p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 30px 30px 20px;">
                  <p style="margin: 0 0 14px; font-size: 16px; font-weight: 700; color: #0f172a;">
                    ${template.greeting(userName)}
                  </p>
                  <p style="margin: 0 0 24px; font-size: 14.5px; line-height: 1.6; color: #475569;">
                    ${template.intro}
                  </p>

                  <div style="margin: 0 0 16px; font-size: 13px; font-weight: 800; color: #2563eb; letter-spacing: 0.5px; text-transform: uppercase;">
                    ${template.keyPointsTitle}
                  </div>

                  <!-- Key Points List -->
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 28px;">
                    ${keyPointsHtml}
                  </table>

                  <!-- Primary Action Button -->
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${template.ctaUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 13px 32px; border-radius: 10px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
                      ${template.ctaText} →
                    </a>
                  </div>

                  <!-- Support Box -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 20px; margin-top: 24px;">
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                      💬 <strong>Direct Support:</strong> ${template.supportNote}
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0 0 6px; font-size: 12px; color: #64748b;">
                    © ${new Date().getFullYear()} AITAG — Affordable AI Business Deliverables. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                    Bengaluru & Hyderabad, India • <a href="mailto:contact@aitag.in" style="color: #2563eb; text-decoration: none;">contact@aitag.in</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return {
    subject: template.subject,
    text: plainText,
    html
  };
}

module.exports = {
  WELCOME_TEMPLATES,
  renderWelcomeEmail
};
