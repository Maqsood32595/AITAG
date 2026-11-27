/**
 * AITAG Grandchild Pure Engine: Admin Discount & Payment Waiver Calculator
 * Domain: domain-services
 */

function toNonNegativeNumber(val) {
  const num = Number(val);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
}

/**
 * Computes consistent pricing & waiver metadata across Orders and Tasks.
 */
function computePricingAdjustment({
  currentOriginalPrice,
  currentAgreedPrice,
  discountAmount = 0,
  skipPayment = false,
  adminEmail = 'admin',
  reason = '',
}) {
  const baseOriginal =
    toNonNegativeNumber(currentOriginalPrice) ||
    toNonNegativeNumber(currentAgreedPrice);

  const clampedDiscount = Math.min(toNonNegativeNumber(discountAmount), baseOriginal);
  const netAfterDiscount = Math.max(0, baseOriginal - clampedDiscount);
  const isWaived = Boolean(skipPayment) || (baseOriginal > 0 && netAfterDiscount === 0);

  const agreed_price = isWaived ? 0 : netAfterDiscount;
  const platform_fee = isWaived ? 0 : Math.round(agreed_price * 0.20);
  const expert_payout = isWaived ? 0 : Math.max(0, agreed_price - platform_fee);
  const now = new Date().toISOString();
  const cleanReason = String(reason || '').trim();

  return {
    original_price: baseOriginal,
    discount_amount: isWaived && clampedDiscount === 0 ? baseOriginal : clampedDiscount,
    discount_reason: !isWaived ? cleanReason : '',
    agreed_price,
    platform_fee,
    expert_payout,
    payment_waived: isWaived,
    payment_status: isWaived ? 'WAIVED' : clampedDiscount > 0 ? 'DISCOUNTED' : 'STANDARD',
    waive_reason: isWaived ? (cleanReason || 'Waived by Admin') : '',
    waived_by: isWaived ? adminEmail : '',
    waived_at: isWaived ? now : null,
  };
}

module.exports = {
  computePricingAdjustment,
};
