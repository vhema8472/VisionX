const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    userName: {
      type: String,
      required: true
    },
    userEmail: {
      type: String,
      required: true
    },
    deskId: {
      type: String,
      default: 'D-101',
      index: true
    },
    workspaceId: {
      type: String,
      required: true
    },
    workspaceName: {
      type: String,
      required: true
    },
    workspaceType: {
      type: String,
      required: true
    },
    bookingType: {
      type: String,
      enum: ['workspace', 'desk', 'meeting-room', 'membership'],
      default: 'desk'
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    hourlyRate: {
      type: Number,
      default: 25.0
    },
    subtotal: {
      type: Number,
      required: true
    },
    serviceFee: {
      type: Number,
      default: 0.0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    specialRequest: {
      type: String,
      default: ''
    },
    paymentId: {
      type: String,
      default: ''
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'Pending', 'Paid', 'Demo Paid'],
      default: 'Demo Paid'
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'active', 'Active'],
      default: 'confirmed'
    },
    createdBy: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    createdByAdminId: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// High Performance Compound Indexes
BookingSchema.index({ userId: 1, createdAt: -1 });
BookingSchema.index({ workspaceId: 1, date: 1, bookingStatus: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ deskId: 1 });
BookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', BookingSchema);
