/**
 * AITAG Account Deletion & Exit Feedback Email Templates
 * Location: workflows/account_deletion_feedback_templates.js
 * 
 * ==============================================================================
 * EDITING INSTRUCTIONS:
 * When you want to modify the account deletion email message, feedback questions,
 * wording, or styling, edit the text strings in this file. Changes will immediately
 * reflect whenever a user deletes their account.
 * ==============================================================================
 */

const ACCOUNT_DELETION_TEMPLATE = {
  subject: "We're sorry to see you go — Account Deletion Confirmation & Feedback | AITAG",
  headline: 'Your AITAG Account Has Been Deleted',
  subheadline: 'We are sorry to see you go. Help us improve with your quick thoughts.',
  greeting: (name) => `Hi ${name || 'there'},`,
  confirmationText: (email) => `This email confirms that your AITAG account (${email}) and associated data have been permanently deleted in accordance with our data privacy standards.`,
  feedbackIntro: 'We are constantly working to improve AITAG for entrepreneurs and AI specialists. If you have 30 seconds, we would genuinely appreciate knowing why you decided to leave:',
  feedbackOptions: [
    '• Couldn’t find the specific AI service, deliverable, or specialist I needed',
    '• Pricing or package scope didn’t fit my current budget',
    '• Platform usability or technical difficulties',
    '• Just testing / exploring the platform temporarily',
    '• Found another solution outside AITAG'
  ],
  replyCallout: 'You can simply reply directly to this email with a quick sentence or two — our founding team reads and values every response.',
  rejoinText: 'If your business needs ever change in the future, you are always welcome back to explore our AI services.',
  signoff: 'Warm regards,\nThe AITAG Team\nhttps://aitag.in'
};

/**
 * Generates Subject, Plain Text, and Responsive HTML for account deletion feedback email
 * @param {Object} user - { name, email, role }
 * @returns {Object} { subject, text, html }
 */
function renderAccountDeletionFeedbackEmail(user) {
  const userName = (user.name || (user.email ? user.email.split('@')[0] : '') || '').trim();
  const userEmail = (user.email || '').trim();

  const plainText = `${ACCOUNT_DELETION_TEMPLATE.greeting(userName)}

${ACCOUNT_DELETION_TEMPLATE.confirmationText(userEmail)}

${ACCOUNT_DELETION_TEMPLATE.feedbackIntro}

${ACCOUNT_DELETION_TEMPLATE.feedbackOptions.join('\n')}

${ACCOUNT_DELETION_TEMPLATE.replyCallout}

${ACCOUNT_DELETION_TEMPLATE.rejoinText}

${ACCOUNT_DELETION_TEMPLATE.signoff}
`;

  const optionsHtml = ACCOUNT_DELETION_TEMPLATE.feedbackOptions.map(opt => `
    <tr>
      <td style="padding: 6px 0; color: #475569; font-size: 13.5px; line-height: 1.5;">
        ${opt}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${ACCOUNT_DELETION_TEMPLATE.subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f8fafc; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);">
              
              <!-- Header Slate Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #334155 0%, #0f172a 100%); padding: 30px; text-align: left;">
                  <div style="font-size: 11px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px;">
                    ✦ AITAG ACCOUNT SERVICES
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; line-height: 1.3;">
                    ${ACCOUNT_DELETION_TEMPLATE.headline}
                  </h1>
                  <p style="margin: 6px 0 0; color: #cbd5e1; font-size: 13.5px;">
                    ${ACCOUNT_DELETION_TEMPLATE.subheadline}
                  </p>
                </td>
              </tr>

              <!-- Body Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #0f172a;">
                    ${ACCOUNT_DELETION_TEMPLATE.greeting(userName)}
                  </p>
                  
                  <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #475569;">
                    ${ACCOUNT_DELETION_TEMPLATE.confirmationText(userEmail)}
                  </p>

                  <!-- Feedback Section -->
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <p style="margin: 0 0 12px; font-size: 14px; font-weight: 700; color: #1e293b;">
                      ${ACCOUNT_DELETION_TEMPLATE.feedbackIntro}
                    </p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 14px;">
                      ${optionsHtml}
                    </table>
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #2563eb; line-height: 1.5;">
                      💬 ${ACCOUNT_DELETION_TEMPLATE.replyCallout}
                    </p>
                  </div>

                  <p style="margin: 0 0 20px; font-size: 13.5px; line-height: 1.6; color: #64748b;">
                    ${ACCOUNT_DELETION_TEMPLATE.rejoinText}
                  </p>

                  <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #334155; font-weight: 600;">
                    Warm regards,<br/>
                    <span style="color: #2563eb;">The AITAG Team</span>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 18px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 11.5px; color: #94a3b8;">
                    © ${new Date().getFullYear()} AITAG • <a href="mailto:contact@aitag.in" style="color: #2563eb; text-decoration: none;">contact@aitag.in</a>
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
    subject: ACCOUNT_DELETION_TEMPLATE.subject,
    text: plainText,
    html
  };
}

module.exports = {
  ACCOUNT_DELETION_TEMPLATE,
  renderAccountDeletionFeedbackEmail
};
