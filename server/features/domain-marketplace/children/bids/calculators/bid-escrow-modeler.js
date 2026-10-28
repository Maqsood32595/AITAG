/**
 * Grandchild: Bid Escrow Modeler
 * Computes statutory payouts and tax reserves for individual proposals
 */

class BidEscrowModeler {
  /**
   * Model payout breakdown for a proposed bid
   * @param {number} bidAmount
   * @param {number} commissionRate Default 10%
   */
  modelPayout(bidAmount, commissionRate = 0.10) {
    const gross = Number(bidAmount);
    if (isNaN(gross) || gross <= 0) {
      throw new Error('Bid amount must be positive');
    }

    const platformFee = Number((gross * commissionRate).toFixed(2));
    const tds194O = Number((gross * 0.01).toFixed(2)); // Sec 194-O 1% TDS
    const netSpecialistEarnings = Number((gross - (platformFee + tds194O)).toFixed(2));

    return {
      grossAmount: gross,
      platformFee,
      section194OTDS: tds194O,
      freelancerNetPayout: netSpecialistEarnings,
      currency: 'INR'
    };
  }
}

module.exports = new BidEscrowModeler();
