// Admin Middleware for restricting admin endpoint access
const adminMiddleware = (req, res, next) => {
  try {
    // In production, check req.user.role === 'Admin' || 'SuperAdmin'
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
};

module.exports = adminMiddleware;
