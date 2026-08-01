const Payment = require('../models/Payment');

const initialSeedPayments = [
  { paymentId: 'PAY-1001', bookingId: 'BK-9901', userId: 'USR-101', amount: 220.0, currency: 'USD', paymentMethod: 'Credit Card', transactionId: 'TXN-908123', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 4) },
  { paymentId: 'PAY-1002', bookingId: 'BK-9902', userId: 'USR-106', amount: 198.0, currency: 'USD', paymentMethod: 'UPI', transactionId: 'TXN-908124', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 3) },
  { paymentId: 'PAY-1003', bookingId: 'BK-9903', userId: 'USR-107', amount: 165.0, currency: 'USD', paymentMethod: 'Netbanking', transactionId: 'TXN-908125', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 2) },
  { paymentId: 'PAY-1004', bookingId: 'BK-9904', userId: 'USR-103', amount: 66.0, currency: 'USD', paymentMethod: 'Credit Card', transactionId: 'TXN-908126', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 1) }
];

const ensureSeedPayments = async () => {
  if (require('mongoose').connection.readyState !== 1) return;
  try {
    const count = await Payment.countDocuments();
    if (count === 0) {
      await Payment.insertMany(initialSeedPayments);
      console.log('🌱 Seeded initial payments into MongoDB collection "payments".');
    }
  } catch (err) {}
};

// @desc    Create new payment record
// @route   POST /api/payments/create
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, membershipBookingId, userId, amount, paymentMethod, transactionId } = req.body;
    const paymentId = `PAY-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment = await Payment.create({
      paymentId,
      bookingId: bookingId || '',
      membershipBookingId: membershipBookingId || '',
      userId: userId || (req.user ? req.user.userId : 'USR-GUEST'),
      amount: amount || 0,
      currency: 'USD',
      paymentMethod: paymentMethod || 'Credit Card',
      transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'paid'
    });

    return res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment: newPayment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Payment processing failed' });
  }
};

// @desc    Verify payment transaction
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;
    const payment = await Payment.findOne({ $or: [{ paymentId }, { transactionId }] });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    return res.status(200).json({
      success: true,
      verified: payment.status === 'paid',
      payment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Payment verification error' });
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const payment = await Payment.findOne({ $or: [{ paymentId }, { _id: paymentId }] });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving payment' });
  }
};

// @desc    Get recent payments (Admin)
// @route   GET /api/admin/payments/recent or GET /api/payments
exports.getRecentPayments = async (req, res) => {
  try {
    await ensureSeedPayments();
    let payments = await Payment.find().sort({ createdAt: -1 });
    if (!payments || payments.length === 0) {
      payments = initialSeedPayments;
    }
    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

exports.ensureSeedPayments = ensureSeedPayments;
