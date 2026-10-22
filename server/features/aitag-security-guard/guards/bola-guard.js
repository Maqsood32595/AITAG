/**
 * Grandchild Security Layer 5: Broken Object Level Authorization (BOLA / IDOR) & RBAC Guard
 * Location: server/features/aitag-security-guard/guards/bola-guard.js
 */

function requireAuth(req, res, next) {
  if (req.user) return next();

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  try {
    const authService = require('../../aitag-auth/service');
    req.user = authService.verifyToken(authHeader.split(' ')[1]);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token expired or invalid' });
  }
}

function requireRole(allowedRoles = []) {
  return function roleCheck(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: role '${req.user.role}' lacks sufficient privileges`
      });
    }
    next();
  };
}

/**
 * Validates that the requesting user is the owner, counterparty, or admin of a target object
 */
function verifyResourceAccess(user, resource) {
  if (!user) return false;
  if (user.role === 'admin') return true;

  const userEmail = (user.email || '').toLowerCase().trim();
  const userId = user.id;

  if (resource.customer_email && resource.customer_email.toLowerCase().trim() === userEmail) return true;
  if (resource.user_email && resource.user_email.toLowerCase().trim() === userEmail) return true;
  if (resource.client_email && resource.client_email.toLowerCase().trim() === userEmail) return true;
  if (resource.freelancer_email && resource.freelancer_email.toLowerCase().trim() === userEmail) return true;
  if (resource.assigned_expert_email && resource.assigned_expert_email.toLowerCase().trim() === userEmail) return true;
  if (resource.expert_email && resource.expert_email.toLowerCase().trim() === userEmail) return true;
  if (resource.user_id && resource.user_id === userId) return true;
  if (resource.id && resource.id === userId) return true;

  return false;
}

module.exports = {
  requireAuth,
  requireRole,
  verifyResourceAccess
};
