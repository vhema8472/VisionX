const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true
    },
    bookingId: {
      type: String,
      default: ''
    },
    membershipBookingId: {
      type: String,
      default: ''
    },
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      default: ''
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentMethod: {
      type: String,
      default: 'Demo Payment'
    },
    transactionId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'Demo Paid'],
      default: 'Demo Paid'
    }
  },
  {
    timestamps: true
  }
);

// High Performance Compound Indexes
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
