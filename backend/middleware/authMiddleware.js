const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Access token missing.'
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('❌ Security Error: JWT_SECRET environment variable is missing.');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET environment variable is missing.'
      });
    }
    const decoded = jwt.verify(token, secret);
    
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ userId: decoded.userId }).select('-passwordHash');
      } catch (dbErr) {}
    }
    
    if (user) {
      req.user = user;
    } else {
      req.user = {
        userId: decoded.userId || 'USR-AUTH',
        role: decoded.role || 'user',
        name: decoded.name || 'Member',
        email: decoded.email || 'member@workhub.io'
      };
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Admin privileges required.'
    });
  }
  next();
};

module.exports = {
  authenticateUser,
  requireAdmin
};
