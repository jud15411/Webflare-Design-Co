const authorize = (requiredPermission) => {
  return (req, res, next) => {
    // 1. Get permissions from the user object (attached by your auth middleware)
    const { permissions } = req.user;

    // 2. Check for SuperAdmin wildcard or the specific permission
    const hasAccess =
      permissions.includes('*') || permissions.includes(requiredPermission);

    if (!hasAccess) {
      return res.status(403).json({
        message: `Access Denied: You do not have the '${requiredPermission}' permission.`,
      });
    }

    next();
  };
};

module.exports = authorize;
