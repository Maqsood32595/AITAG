/**
 * Grandchild: Bid Proposal Validator
 * Validates price limits, delivery estimates, and non-empty proposals
 */

class BidProposalValidator {
  /**
   * Validate and normalize a proposal payload
   * @param {Object} input
   * @param {Object} task
   * @returns {Object} validated data
   */
  validate(input, task) {
    const rawPrice = input.bid_amount !== undefined && input.bid_amount !== null && input.bid_amount !== ''
      ? Number(input.bid_amount)
      : Number(task.budget);

    if (isNaN(rawPrice) || rawPrice <= 0) {
      throw new Error('Proposed bid amount must be a valid positive number');
    }

    const deliveryDays = input.delivery_days ? Math.max(1, parseInt(input.delivery_days, 10)) : 3;
    const proposalPitch = typeof input.proposal_pitch === 'string' ? input.proposal_pitch.trim() : '';

    return {
      bid_amount: rawPrice,
      delivery_days: deliveryDays,
      proposal_pitch: proposalPitch
    };
  }
}

module.exports = new BidProposalValidator();
