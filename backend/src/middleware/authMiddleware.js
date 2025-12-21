const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  // 1. Grabs the cookie directly
  let token = req.cookies.token;

  // 2. Fallback check for "Bearer" in case some requests use headers
  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token found' });
  }

  try {
    // 3. Verify the JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Populate req.user with full DB data (branch, userName, etc.)
    // This solves the 'null' username issue in your logs
    req.user = await User.findById(decoded.id)
      .select('-password')
      .populate('role');

    if (!req.user) {
      return res.status(401).json({ message: 'User session invalid' });
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
};

module.exports = { protect };
