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
      default: 'Credit Card'
    },
    transactionId: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'paid'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', PaymentSchema);
