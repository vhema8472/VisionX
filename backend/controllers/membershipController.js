const Membership = require('../models/Membership');
const MembershipBooking = require('../models/MembershipBooking');

const defaultPlans = [
  { membershipId: 'MB-001', name: 'Basic Explorer', description: 'Flexible access 2 days a week with high speed wifi', price: 99.0, duration: '1 Month', benefits: ['8 Days Workspace Access', 'High Speed Wifi', 'Community Events'], status: 'active' },
  { membershipId: 'MB-002', name: 'Professional Flex', description: 'Full week hot desk access with meeting room credits', price: 249.0, duration: '1 Month', benefits: ['Unlimited Hot Desk', '5 HRS Meeting Room', 'Free Printing (100 pgs)'], status: 'active' },
  { membershipId: 'MB-003', name: 'Enterprise Dedicated', description: '24/7 dedicated workstation with cabinet locker', price: 499.0, duration: '1 Month', benefits: ['Dedicated Workstation', '24/7 Premium Access', '15 HRS Meeting Room', 'Mail Handling'], status: 'active' },
  { membershipId: 'MB-004', name: 'VIP Suite Pass', description: 'Exclusive private cabin access with executive lounge rights', price: 899.0, duration: '1 Month', benefits: ['Private Cabin Suite', '24/7 Access', 'Unlimited Meeting Room', 'Executive Lounge Rights'], status: 'active' }
];

const ensureSeedMemberships = async () => {
  try {
    const count = await Membership.countDocuments();
    if (count === 0) {
      await Membership.insertMany(defaultPlans);
    }
  } catch (e) {}
};

// @desc    Get membership plans
// @route   GET /api/memberships
exports.getMembershipPlans = async (req, res) => {
  try {
    await ensureSeedMemberships();
    let plans = await Membership.find({ status: 'active' });
    if (!plans || plans.length === 0) plans = defaultPlans;
    return res.status(200).json({ success: true, count: plans.length, plans });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch membership plans' });
  }
};

// @desc    Book a membership subscription
// @route   POST /api/memberships/book
exports.createMembershipBooking = async (req, res) => {
  try {
    const { membershipId, planName, price } = req.body;
    const userId = req.user ? req.user.userId : 'USR-GUEST';
    const userName = req.user ? req.user.name : 'Member';
    const userEmail = req.user ? req.user.email : '';

    const startDate = new Date().toISOString().split('T')[0];
    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + 1);
    const endDate = endDateObj.toISOString().split('T')[0];

    const membershipBookingId = `MBK-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking = await MembershipBooking.create({
      membershipBookingId,
      userId,
      membershipId: membershipId || 'MB-002',
      userName,
      userEmail,
      membershipName: planName || 'Professional Flex',
      startDate,
      endDate,
      amount: price || 249.0,
      paymentStatus: 'paid',
      status: 'active'
    });

    return res.status(201).json({
      success: true,
      message: 'Membership activated successfully',
      membershipBooking: newBooking
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to process membership booking' });
  }
};

// @desc    Get all membership bookings (Admin)
// @route   GET /api/admin/memberships
exports.getAdminMembershipBookings = async (req, res) => {
  try {
    const bookings = await MembershipBooking.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch membership bookings' });
  }
};
