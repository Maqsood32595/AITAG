/**
 * Grandchild: Binary Tier Resolver
 * Maps any legacy tier name to the binary Starter / Pro model
 */

const TIER_ALIAS_MAP = {
  package_1: 'starter',
  beginner: 'starter',
  starter: 'starter',
  package_2: 'pro',
  package_3: 'pro',
  medium: 'pro',
  expert: 'pro',
  pro: 'pro',
};

function resolveTierAlias(tierName) {
  const key = (tierName || '').toLowerCase().trim();
  return TIER_ALIAS_MAP[key] || 'starter';
}

module.exports = {
  TIER_ALIAS_MAP,
  resolveTierAlias
};
