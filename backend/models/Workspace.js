const mongoose = require('mongoose');

const WorkspaceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['Hot Desk', 'Dedicated Desk', 'Private Cabin', 'Meeting Room']
    },
    description: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'Downtown Executive Hub'
    },
    address: {
      type: String,
      default: '123 Innovation Way, Tech District'
    },
    latitude: {
      type: Number,
      default: 37.7749
    },
    longitude: {
      type: Number,
      default: -122.4194
    },
    capacity: {
      type: Number,
      default: 1
    },
    amenities: {
      type: [String],
      default: ['High-Speed WiFi', 'Ergonomic Chair', 'Coffee & Tea', 'Power Outlets']
    },
    image: {
      type: String,
      default: ''
    },
    pricePerHour: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'maintenance', 'inactive'],
      default: 'available'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Workspace', WorkspaceSchema);
