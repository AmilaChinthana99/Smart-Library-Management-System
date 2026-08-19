const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_smart_library_jwt_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User belonging to this token no longer exists' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is deactivated. Please contact administrator' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
