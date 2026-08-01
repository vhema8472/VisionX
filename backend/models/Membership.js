const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema(
  {
    membershipId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true
    },
    duration: {
      type: String,
      default: '1 Month'
    },
    benefits: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Membership', MembershipSchema);
