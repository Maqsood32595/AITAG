/**
 * Real-Time PII & Contact Info Interception Filter
 */

class LeakageShieldService {
  constructor() {
    this.patterns = [
      { type: "PHONE", regex: /(?:\+91[\s-]?)?[6-9]\d{9}|\b\d{5}[\s-]?\d{5}\b/gi },
      { type: "EMAIL", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi },
      { type: "UPI", regex: /[a-zA-Z0-9._-]+@(ybl|okaxis|okicici|oksbi|paytm|upi|apl)/gi },
      { type: "OFF_PLATFORM", regex: /\b(whatsapp|wa\.me|gpay|google pay|phonepe|paytm|wire transfer|direct bank|call me)\b/gi }
    ];
  }

  filterMessage(text) {
    if (!text || typeof text !== 'string') return { cleanText: "", leaked: false };

    let cleanText = text;
    let leaked = false;
    const matches = [];

    this.patterns.forEach(p => {
      const found = cleanText.match(p.regex);
      if (found) {
        leaked = true;
        found.forEach(m => matches.push({ type: p.type, match: m }));
        cleanText = cleanText.replace(p.regex, '[REDACTED BY AITAG SHIELD]');
      }
    });

    return {
      originalText: text,
      cleanText,
      leaked,
      matches,
      warning: leaked ? "⚠️ Off-platform transaction attempt detected. Escrow safety suspended for unverified contact." : null
    };
  }
}

module.exports = new LeakageShieldService();
