/**
 * Real-Time PII & Contact Info Interception Filter
 * Child of Domain: `domain-security`
 */

const piiRedactor = require('../../grandchildren/pii-redactor');

class LeakageShieldService {
  filterMessage(text) {
    return piiRedactor.filterMessage(text);
  }
}

module.exports = new LeakageShieldService();
