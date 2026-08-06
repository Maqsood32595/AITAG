/**
 * Escrow Payment & Section 194-O TDS Compliance Service
 */

class EscrowPaymentService {
  calculateSplits(grossAmount, commissionRate = 0.10) {
    const A = Number(grossAmount);
    if (isNaN(A) || A <= 0) throw new Error("Invalid transaction gross amount");

    const platformCommission = Number((A * commissionRate).toFixed(2));
    const tdsWithholding = Number((A * 0.01).toFixed(2)); // Sec 194-O 1% TDS
    const freelancerPayout = Number((A - (platformCommission + tdsWithholding)).toFixed(2));

    return {
      grossAmount: A,
      commissionRate,
      splits: {
        freelancerNetPayout: freelancerPayout,
        platformCommissionFee: platformCommission,
        section194OTDSWithholding: tdsWithholding
      },
      ledgers: [
        { account: "Freelancer Trustee Bank Escrow", amount: freelancerPayout, purpose: "Net Freelancer Disbursal" },
        { account: "AITAG Operational Revenue", amount: platformCommission, purpose: "Platform Matching Fee" },
        { account: "Central Government Tax Depository", amount: tdsWithholding, purpose: "Section 194-O TDS (1%)" }
      ]
    };
  }
}

module.exports = new EscrowPaymentService();
