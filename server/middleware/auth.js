const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token and authenticate user
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const header = req.header('Authorization');
    
    if (!header) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Check if format is Bearer token
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    const token = parts[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    } else {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Middleware to check specific permissions
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    
    // Admin has all permissions
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Check specific permission
    if (req.user.permissions && req.user.permissions[permission]) {
      return next();
    }
    
    return res.status(403).json({ message: `Permission denied. '${permission}' required.` });
  };
};
