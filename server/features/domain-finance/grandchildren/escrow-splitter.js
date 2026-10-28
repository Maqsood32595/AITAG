/**
 * Grandchild: Escrow Split & Section 194-O TDS Calculator
 * Enforces Indian Tax Compliance (1% TDS on e-commerce participants)
 */

class EscrowSplitter {
  /**
   * Calculate statutory splits & platform fee
   * @param {number} grossAmount
   * @param {number} commissionRate Default 10%
   */
  calculate(grossAmount, commissionRate = 0.10) {
    const gross = Number(grossAmount);
    if (isNaN(gross) || gross <= 0) {
      throw new Error('Gross amount must be a positive number');
    }

    const platformCommission = Number((gross * commissionRate).toFixed(2));
    const tdsWithholding = Number((gross * 0.01).toFixed(2)); // Sec 194-O 1% TDS
    const specialistNetPayout = Number((gross - (platformCommission + tdsWithholding)).toFixed(2));

    return {
      grossAmount: gross,
      commissionRate,
      splits: {
        specialistNetPayout,
        platformCommission,
        section194OTDSWithholding: tdsWithholding
      },
      audit: {
        timestamp: new Date().toISOString(),
        rule: 'Section 194-O Finance Act 2020'
      }
    };
  }
}

module.exports = new EscrowSplitter();
