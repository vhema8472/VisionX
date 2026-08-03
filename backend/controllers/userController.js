const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const MembershipBooking = require('../models/MembershipBooking');
const { sharedUsersStore } = require('./authController');

// @desc    Get authenticated user profile
// @route   GET /api/users/profile or GET /api/users/me
exports.getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userId = req.user.userId;
    const userEmail = req.user.email;

    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [{ userId }, { email: userEmail }]
        }).select('-passwordHash -pinHash');
      } catch (dbErr) {}
    }

    if (!user && sharedUsersStore) {
      user = sharedUsersStore.find(u => u.userId === userId || u.email === userEmail);
    }

    if (!user) {
      user = {
        userId,
        name: req.user.name || 'Member',
        email: userEmail,
        phone: req.user.phone || '',
        role: req.user.role || 'user'
      };
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.userId || userId,
        userId: user.userId || userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'user',
        profileImage: user.profileImage || '',
        authProvider: user.authProvider || 'local',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('getProfile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile or PUT /api/users/me
exports.updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const userId = req.user.userId;
    const { name, phone, address, city, state, postalCode, country, profileImage } = req.body;

    let updatedUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        updatedUser = await User.findOneAndUpdate(
          { userId },
          { $set: { name, phone, address, city, state, postalCode, country, profileImage } },
          { new: true }
        ).select('-passwordHash -pinHash');
      } catch (e) {}
    }

    if (sharedUsersStore) {
      const match = sharedUsersStore.find(u => u.userId === userId || u.email === req.user.email);
      if (match) {
        if (name) match.name = name;
        if (phone) match.phone = phone;
        if (profileImage) match.profileImage = profileImage;
        if (!updatedUser) updatedUser = match;
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser || { userId, name, email: req.user.email }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// @desc    Get user payment history
// @route   GET /api/users/me/payments
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : '';
    let payments = [];
    if (mongoose.connection.readyState === 1) {
      try {
        payments = await Payment.find({ userId }).sort({ createdAt: -1 });
      } catch (e) {}
    }
    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// @desc    Get user memberships
// @route   GET /api/users/me/memberships
exports.getUserMemberships = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : '';
    let memberships = [];
    if (mongoose.connection.readyState === 1) {
      try {
        memberships = await MembershipBooking.find({ userId }).sort({ createdAt: -1 });
      } catch (e) {}
    }
    return res.status(200).json({ success: true, count: memberships.length, memberships });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch memberships' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users or GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    let users = [];
    if (mongoose.connection.readyState === 1) {
      try {
        users = await User.find().select('-passwordHash -pinHash').lean();
      } catch (e) {}
    }
    if (!users || users.length === 0) {
      users = sharedUsersStore || [];
    }

    // Explicitly sanitize sensitive credentials (password, passwordHash, pin, pinHash)
    const sanitizedUsers = users.map(u => {
      const userObj = u.toObject ? u.toObject() : { ...u };
      delete userObj.password;
      delete userObj.passwordHash;
      delete userObj.pin;
      delete userObj.pinHash;
      return userObj;
    });

    return res.status(200).json({ success: true, count: sanitizedUsers.length, users: sanitizedUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};
