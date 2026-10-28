/**
 * Grandchild: Escrow Settlement Engine
 * Handles final approval, releases funds to specialist wallet,
 * and withholds Section 194-O TDS compliance records.
 */

class EscrowSettlementEngine {
  /**
   * Calculate final disbursement & statutory deductions
   * @param {number} grossAmount
   * @param {Object} options
   */
  settlePayout(grossAmount, options = {}) {
    const gross = Number(grossAmount);
    if (isNaN(gross) || gross <= 0) {
      throw new Error('Valid gross payout amount is required for escrow settlement');
    }

    const platformFeeRate = options.platformFeeRate || 0.10;
    const tdsRate = 0.01; // Sec 194-O 1% TDS

    const platformCommission = Number((gross * platformFeeRate).toFixed(2));
    const tdsWithholding = Number((gross * tdsRate).toFixed(2));
    const netSpecialistDisbursement = Number((gross - (platformCommission + tdsWithholding)).toFixed(2));

    return {
      grossEscrowReleased: gross,
      platformFee: platformCommission,
      section194OTDS: tdsWithholding,
      netSpecialistPayout: netSpecialistDisbursement,
      settled_at: new Date().toISOString(),
      statutoryCompliance: {
        tdsCertificateRequired: true,
        panProvided: !!options.pan,
        section: '194-O'
      }
    };
  }
}

module.exports = new EscrowSettlementEngine();
