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
    if (!user || !(await user.comparePassword(password))) {
      logger.warn('Login attempt failed', {
        userName,
        ip: userIp,
        event: 'AUTH_FAILURE',
      });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '8h',
    });
    const csrfToken = crypto.randomBytes(32).toString('hex');

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });
    res.cookie('XSRF-TOKEN', csrfToken, {
      secure: true,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        userName: user.userName,
        role: user.role.name,
        branch: user.branch,
        permissions: user.role.permissions,
      },
    });
  } catch (err) {
    logger.error('Critical Auth Error', { error: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('XSRF-TOKEN');
  res.json({ message: 'Logout successful' });
};
