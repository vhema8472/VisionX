const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      default: ''
    },
    passwordHash: {
      type: String,
      default: ''
    },
    pinHash: {
      type: String,
      default: ''
    },
    googleId: {
      type: String,
      default: ''
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    profileImage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// High Performance Compound Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);
