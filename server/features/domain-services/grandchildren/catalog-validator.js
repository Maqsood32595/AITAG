/**
 * Grandchild: Catalog Validator
 * Validates package structure and delivery day physical invariants
 */

function validatePackage(pkg) {
  if (!pkg.slug || !pkg.title || !Array.isArray(pkg.tiers)) {
    throw new Error(`Invalid package structure: ${pkg.slug}`);
  }
  pkg.tiers.forEach((tier) => {
    if (!['starter', 'pro'].includes(tier.tier_name)) {
      throw new Error(`Invalid tier name "${tier.tier_name}" in package "${pkg.slug}" — must be starter or pro`);
    }
    if (typeof tier.price_min !== 'number' || tier.price_min <= 0) {
      throw new Error(`Invalid price_min in tier "${tier.tier_name}" of package "${pkg.slug}"`);
    }
    if (typeof tier.delivery_days_min !== 'number' || typeof tier.delivery_days_max !== 'number') {
      throw new Error(`Invalid delivery days in tier "${tier.tier_name}" of package "${pkg.slug}"`);
    }
  });
  return true;
}

module.exports = {
  validatePackage
};
