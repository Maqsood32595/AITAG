/**
 * Grandchild: UPI Deep-Link & Intent Generator
 * Compliant with NPCI UPI 2.0 specs
 */

class UpiGateway {
  /**
   * Generate an NPCI-compliant UPI deep-link URI
   * @param {Object} params
   * @param {string} params.vpa - Payee VPA
   * @param {string} params.payeeName - Payee legal name
   * @param {number} params.amount - INR amount
   * @param {string} params.referenceId - Order or Task ID
   * @param {string} params.note - Transaction note
   * @returns {string} upi:// URI
   */
  generateUri({ vpa, payeeName, amount, referenceId, note }) {
    if (!vpa || !payeeName || !amount) {
      throw new Error('vpa, payeeName, and amount are required for UPI generation');
    }
    const params = new URLSearchParams({
      pa: vpa,
      pn: payeeName,
      am: Number(amount).toFixed(2),
      cu: 'INR',
      tn: (note || `AITAG Escrow ${referenceId}`).substring(0, 50),
      tr: referenceId
    });
    return `upi://pay?${params.toString()}`;
  }
}

module.exports = new UpiGateway();
