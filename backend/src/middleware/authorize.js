// middleware/authorize.js
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    // Ensure the role was populated by the authMiddleware fix above
    const userPermissions = req.user?.role?.permissions || [];

    // 1. If user is SuperAdmin (*), bypass all checks
    if (userPermissions.includes('*')) {
      return next();
    }

    // 2. Otherwise, check if they have at least one required permission
    const hasAccess = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAccess) {
      return res.status(403).json({
        message: 'Access Denied: Insufficient permissions for this branch.',
      });
    }

    next();
  };
};

module.exports = authorize;
