const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    try {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Please log in to access this resource'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists'
            });
        }

        // Check if user changed password after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                status: 'error',
                message: 'User recently changed password. Please log in again'
            });
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Not authorized to access this route'
        });
    }
};

// Restrict to certain roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'You do not have permission to perform this action'
            });
        }
        next();
    };
};

// Check if user is logged in (for rendered pages)
exports.isLoggedIn = async (req, res, next) => {
    try {
        if (req.cookies.jwt) {
            // Verify token
            const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

            // Check if user still exists
            const user = await User.findById(decoded.id);
            if (!user) {
                return next();
            }

            // Check if user changed password after token was issued
            if (user.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            // There is a logged in user
            res.locals.user = user;
            return next();
        }
        next();
    } catch (err) {
        next();
    }
}; 