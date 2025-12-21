const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
  const { userName, password } = req.body;
  const rawIp =
    req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  const userIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;

  try {
    const user = await User.findOne({ userName }).populate('role');

    if (!user) {
      logger.warn('Login attempt failed: User not found', {
        userName,
        ip: userIp,
        event: 'AUTH_FAILURE_USER_MISSING',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Login attempt failed: Invalid password', {
        userName,
        ip: userIp,
        userId: user._id,
        event: 'AUTH_FAILURE_WRONG_PASSWORD',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    logger.info('User login successful', {
      userId: user._id,
      userName: user.userName,
      branch: user.branch,
      role: user.role.name,
      ip: userIp,
      event: 'AUTH_SUCCESS',
    });

    // Restore full JWT payload
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role.name,
        branch: user.branch,
        permissions: user.role.permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    const csrfToken = crypto.randomBytes(64).toString('hex');
    const cookieDomain = process.env.COOKIE_DOMAIN;
    const isProduction = process.env.NODE_ENV === 'production';

    // Restore exact cookie settings
    res.cookie('token', token, {
      domain: cookieDomain,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.cookie('XSRF-TOKEN', csrfToken, {
      domain: cookieDomain,
      httpOnly: false, // Allowed for Axios access
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        branch: user.branch,
        permissions: user.role.permissions,
      },
    });
  } catch (err) {
    logger.error('Critical Auth System Error', {
      error: err.message,
      stack: err.stack,
      event: 'SYSTEM_ERROR',
    });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  const identifier = req.body?.userName || 'Active Session';
  const rawIp =
    req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
  const userIp = typeof rawIp === 'string' ? rawIp.split(',')[0].trim() : rawIp;
  const isProduction = process.env.NODE_ENV === 'production';

  logger.info('User logout successful', {
    userName: identifier,
    ip: userIp,
    event: 'AUTH_LOGOUT',
  });

  const clearOptions = {
    domain: process.env.COOKIE_DOMAIN,
    secure: isProduction, // Matches login settings
    sameSite: 'lax',
    path: '/', // Ensure path matches for successful deletion
  };

  res.clearCookie('token', clearOptions);
  res.clearCookie('XSRF-TOKEN', clearOptions);
  res.json({ message: 'Logged out successfully' });
};
