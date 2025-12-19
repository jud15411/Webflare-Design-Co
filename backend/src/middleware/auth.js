// Middleware to restrict access based on branch
const authorizeBranch = (allowedBranches) => {
  return (req, res, next) => {
    // We assume 'req.user' is populated by your JWT auth logic
    if (!allowedBranches.includes(req.user.branch)) {
      return res.status(403).json({ message: "Access Denied: Wrong Branch" });
    }
    next();
  };
};

module.exports = { authorizeBranch };