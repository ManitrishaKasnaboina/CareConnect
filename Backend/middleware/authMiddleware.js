const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = String(req.user?.role || '').trim().toUpperCase();
    const allowedRoles = roles.map(role => String(role).trim().toUpperCase());

    if (!req.user || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `User role ${req.user ? userRole : 'Unknown'} is not authorized to access this route`
      });
    }
    next();
  };
};
