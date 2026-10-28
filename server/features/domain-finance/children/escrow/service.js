/**
 * Escrow Payment & Section 194-O TDS Compliance Service
 * Child of Domain: `domain-finance`
 */

const escrowSplitter = require('../../grandchildren/escrow-splitter');

class EscrowPaymentService {
  calculateSplits(grossAmount, commissionRate = 0.10) {
    const calc = escrowSplitter.calculate(grossAmount, commissionRate);
    return {
      grossAmount: calc.grossAmount,
      commissionRate: calc.commissionRate,
      splits: {
        freelancerNetPayout: calc.splits.specialistNetPayout,
        platformCommissionFee: calc.splits.platformCommission,
        section194OTDSWithholding: calc.splits.section194OTDSWithholding
      },
      ledgers: [
        { account: "Freelancer Trustee Bank Escrow", amount: calc.splits.specialistNetPayout, purpose: "Net Freelancer Disbursal" },
        { account: "AITAG Operational Revenue", amount: calc.splits.platformCommission, purpose: "Platform Matching Fee" },
        { account: "Central Government Tax Depository", amount: calc.splits.section194OTDSWithholding, purpose: "Section 194-O TDS (1%)" }
      ]
    };
  }
}

module.exports = new EscrowPaymentService();
