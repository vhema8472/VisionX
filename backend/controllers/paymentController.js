const mongoose = require('mongoose');
const Payment = require('../models/Payment');

const initialSeedPayments = [
  { paymentId: 'PAY-1001', bookingId: 'BK-9901', userId: 'USR-101', userName: 'Alex Johnson', amount: 220.0, currency: 'USD', paymentMethod: 'Credit Card', transactionId: 'TXN-908123', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 4) },
  { paymentId: 'PAY-1002', bookingId: 'BK-9902', userId: 'USR-106', userName: 'Sophia Taylor', amount: 198.0, currency: 'USD', paymentMethod: 'UPI', transactionId: 'TXN-908124', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 3) },
  { paymentId: 'PAY-1003', bookingId: 'BK-9903', userId: 'USR-107', userName: 'James Wilson', amount: 165.0, currency: 'USD', paymentMethod: 'Netbanking', transactionId: 'TXN-908125', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 2) },
  { paymentId: 'PAY-1004', bookingId: 'BK-9904', userId: 'USR-103', userName: 'David Chen', amount: 66.0, currency: 'USD', paymentMethod: 'Credit Card', transactionId: 'TXN-908126', status: 'paid', createdAt: new Date(Date.now() - 3600000 * 1) }
];

const sharedPaymentsStore = [...initialSeedPayments];

const ensureSeedPayments = async () => {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const count = await Payment.countDocuments();
    if (count === 0) {
      await Payment.insertMany(initialSeedPayments);
      console.log('🌱 Seeded initial payments into MongoDB collection "payments".');
    }
  } catch (err) {}
};

// @desc    Create new payment record
// @route   POST /api/payments/create or /api/payments/process
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, membershipBookingId, userId, amount, paymentMethod, transactionId } = req.body;
    const paymentId = `PAY-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const finalUserId = (req.user && req.user.userId) ? req.user.userId : (userId || 'USR-GUEST');
    const finalUserName = (req.user && req.user.name) ? req.user.name : 'Member';

    const newPaymentObj = {
      paymentId,
      bookingId: bookingId || '',
      membershipBookingId: membershipBookingId || '',
      userId: finalUserId,
      userName: finalUserName,
      amount: typeof amount === 'number' ? amount : parseFloat(String(amount || 0).replace(/[^0-9.-]+/g, "")),
      currency: 'USD',
      paymentMethod: paymentMethod || 'Credit Card',
      transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'paid',
      createdAt: new Date()
    };

    sharedPaymentsStore.unshift(newPaymentObj);

    if (mongoose.connection.readyState === 1) {
      try {
        await Payment.create(newPaymentObj);
        console.log('✅ Payment created in MongoDB:', paymentId);
      } catch (dbErr) {}
    }

    return res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      payment: newPaymentObj
    });
  } catch (error) {
    console.error('Create Payment Error:', error);
    return res.status(500).json({ success: false, message: 'Payment processing failed', error: error.message });
  }
};

// @desc    Verify payment transaction
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { paymentId, transactionId } = req.body;
    let payment = null;

    if (mongoose.connection.readyState === 1) {
      try {
        payment = await Payment.findOne({ $or: [{ paymentId }, { transactionId }] });
      } catch (e) {}
    }

    if (!payment) {
      payment = sharedPaymentsStore.find(p => p.paymentId === paymentId || p.transactionId === transactionId);
    }

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

// @desc    Get single payment details
// @route   GET /api/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const id = req.params.id;
    let payment = null;

    if (mongoose.connection.readyState === 1) {
      try {
        payment = await Payment.findOne({ $or: [{ paymentId: id }, { _id: id }] });
      } catch (e) {}
    }

    if (!payment) {
      payment = sharedPaymentsStore.find(p => p.paymentId === id);
    }

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving payment' });
  }
};

// @desc    Get recent payments for Admin
// @route   GET /api/payments or /api/admin/payments/recent
exports.getRecentPayments = async (req, res) => {
  try {
    let payments = [];
    if (mongoose.connection.readyState === 1) {
      try {
        await ensureSeedPayments();
        payments = await Payment.find().sort({ createdAt: -1 }).limit(10);
      } catch (e) {}
    }

    if (!payments || payments.length === 0) {
      payments = sharedPaymentsStore;
    }

    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

exports.sharedPaymentsStore = sharedPaymentsStore;
exports.ensureSeedPayments = ensureSeedPayments;
