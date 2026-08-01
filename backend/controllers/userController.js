const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const MembershipBooking = require('../models/MembershipBooking');

// Default initial seed users for fallback
const initialSeedUsers = [
  { userId: 'USR-101', name: 'Alex Johnson', email: 'alex.johnson@cloudscale.ai', phone: '+1 (555) 019-2834', role: 'user', profileImage: '', createdAt: new Date() },
  { userId: 'USR-102', name: 'Sophia Taylor', email: 'sophia.taylor@designlab.io', phone: '+1 (555) 014-9821', role: 'user', profileImage: '', createdAt: new Date() },
  { userId: 'USR-103', name: 'David Chen', email: 'david.chen@fintech.org', phone: '+1 (555) 018-3342', role: 'user', profileImage: '', createdAt: new Date() },
  { userId: 'USR-104', name: 'Sarah Jenkins', email: 'sarah.jenkins@cloudscale.ai', phone: '+1 (555) 012-3456', role: 'user', profileImage: '', createdAt: new Date() },
  { userId: 'USR-105', name: 'WorkHub Admin', email: 'admin@workhub.com', phone: '+1 (555) 000-0000', role: 'admin', profileImage: '', createdAt: new Date() }
];

const ensureSeedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      await User.insertMany(initialSeedUsers);
    }
  } catch (e) {}
};

// @desc    Get user profile
// @route   GET /api/users/me
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'USR-104';
    let user = await User.findOne({ userId }).select('-passwordHash');

    if (!user) {
      user = initialSeedUsers.find(u => u.userId === userId) || initialSeedUsers[3];
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'USR-104';
    const { name, phone, email } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: { name, phone, email } },
      { new: true }
    ).select('-passwordHash');

    return res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// @desc    Get user's payments
// @route   GET /api/users/me/payments
exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'USR-104';
    const payments = await Payment.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user payments' });
  }
};

// @desc    Get user's memberships
// @route   GET /api/users/me/memberships
exports.getUserMemberships = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : 'USR-104';
    const memberships = await MembershipBooking.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: memberships.length, memberships });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user memberships' });
  }
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users or /api/users
exports.getAllUsers = async (req, res) => {
  try {
    await ensureSeedUsers();
    let users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    if (!users || users.length === 0) users = initialSeedUsers;

    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

exports.ensureSeedUsers = ensureSeedUsers;
