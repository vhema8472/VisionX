const Workspace = require('../models/Workspace');
const Booking = require('../models/Booking');

const defaultWorkspaces = [
  {
    workspaceId: 'WS-001',
    name: 'Executive Hot Desk H-01',
    type: 'Hot Desk',
    description: 'Flexible desk space with high-speed fiber internet and premium ergonomic chair.',
    location: 'Downtown Executive Hub',
    address: '123 Innovation Way, Tech District',
    capacity: 1,
    amenities: ['High-Speed WiFi', 'Coffee & Tea', 'Power Outlets', 'Access to Lounge'],
    pricePerHour: 15.0,
    status: 'available'
  },
  {
    workspaceId: 'WS-002',
    name: 'Dedicated Desk D-14',
    type: 'Dedicated Desk',
    description: 'Reserved personal workstation with lockable storage and dual-monitor setup support.',
    location: 'Downtown Executive Hub',
    address: '123 Innovation Way, Tech District',
    capacity: 1,
    amenities: ['24/7 Access', 'Dual Monitors', 'Personal Locker', 'Free Printing'],
    pricePerHour: 25.0,
    status: 'available'
  },
  {
    workspaceId: 'WS-003',
    name: 'Executive Private Cabin P-12',
    type: 'Private Cabin',
    description: 'Soundproof private office suite with panoramic views and executive desk.',
    location: 'Downtown Executive Hub',
    address: '123 Innovation Way, Tech District',
    capacity: 4,
    amenities: ['Soundproof Walls', 'Private Whiteboard', 'Executive Desk', 'Video Call Setup'],
    pricePerHour: 45.0,
    status: 'available'
  },
  {
    workspaceId: 'WS-004',
    name: 'Boardroom Conference Hall M-02',
    type: 'Meeting Room',
    description: 'Spacious meeting space equipped with 4K display presentation display and conferencing mic.',
    location: 'Downtown Executive Hub',
    address: '123 Innovation Way, Tech District',
    capacity: 10,
    amenities: ['4K Smart Display', 'Conference Mic', 'Whiteboard', 'Catering Service'],
    pricePerHour: 75.0,
    status: 'available'
  }
];

const ensureSeedWorkspaces = async () => {
  try {
    const count = await Workspace.countDocuments();
    if (count === 0) {
      await Workspace.insertMany(defaultWorkspaces);
      console.log('🌱 Seeded default workspaces into MongoDB collection "workspaces".');
    }
  } catch (err) {}
};

let workspaceCache = null;
let workspaceCacheTime = 0;

// @desc    Get all workspaces (with 60s in-memory caching)
// @route   GET /api/workspaces
exports.getWorkspaces = async (req, res) => {
  try {
    const now = Date.now();
    if (workspaceCache && (now - workspaceCacheTime < 60000)) {
      return res.status(200).json({ success: true, count: workspaceCache.length, workspaces: workspaceCache });
    }

    let workspaces = [];
    if (require('mongoose').connection.readyState === 1) {
      try {
        workspaces = await Workspace.find({ status: { $ne: 'inactive' } }).lean();
      } catch(e) {}
    }

    if (!workspaces || workspaces.length === 0) {
      workspaces = defaultWorkspaces;
    }

    workspaceCache = workspaces;
    workspaceCacheTime = now;

    return res.status(200).json({ success: true, count: workspaces.length, workspaces });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving workspaces' });
  }
};

// @desc    Get single workspace details
// @route   GET /api/workspaces/:id
exports.getWorkspaceById = async (req, res) => {
  try {
    await ensureSeedWorkspaces();
    const wsId = req.params.id;
    let workspace = await Workspace.findOne({ $or: [{ workspaceId: wsId }, { _id: wsId }] });

    if (!workspace) {
      workspace = defaultWorkspaces.find(w => w.workspaceId === wsId);
    }

    if (!workspace) {
      return res.status(404).json({ success: false, message: 'Workspace not found' });
    }

    return res.status(200).json({ success: true, workspace });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving workspace' });
  }
};

// Helper: Convert time string "10:00 AM" to minutes from midnight
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const normalized = timeStr.trim().toUpperCase();
  const match = normalized.match(/(\d+):(\d+)\s*(AM|PM)?/);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// @desc    Check workspace time availability for a date
// @route   GET /api/workspaces/:id/availability?date=YYYY-MM-DD
exports.getAvailability = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const dateStr = req.query.date || new Date().toISOString().split('T')[0];

    // Find all confirmed/pending bookings for this workspace and date
    let existingBookings = [];
    try {
      existingBookings = await Booking.find({
        $or: [{ workspaceId }, { workspaceName: workspaceId }],
        date: dateStr,
        bookingStatus: { $in: ['confirmed', 'pending', 'Active'] }
      });
    } catch (e) {}

    // Business Operating Hours: 09:00 AM to 06:00 PM (540 min to 1080 min)
    const timeSlots = [
      { start: '09:00 AM', end: '10:00 AM', startMin: 540, endMin: 600 },
      { start: '10:00 AM', end: '11:00 AM', startMin: 600, endMin: 660 },
      { start: '11:00 AM', end: '12:00 PM', startMin: 660, endMin: 720 },
      { start: '12:00 PM', end: '01:00 PM', startMin: 720, endMin: 780 },
      { start: '01:00 PM', end: '02:00 PM', startMin: 780, endMin: 840 },
      { start: '02:00 PM', end: '03:00 PM', startMin: 840, endMin: 900 },
      { start: '03:00 PM', end: '04:00 PM', startMin: 900, endMin: 960 },
      { start: '04:00 PM', end: '05:00 PM', startMin: 960, endMin: 1020 },
      { start: '05:00 PM', end: '06:00 PM', startMin: 1020, endMin: 1080 }
    ];

    const schedule = timeSlots.map(slot => {
      // Check overlap with existing bookings
      const isBooked = existingBookings.some(b => {
        const bStart = timeToMinutes(b.startTime || b.arrivalTime);
        const bEnd = timeToMinutes(b.endTime) || (bStart + (parseInt(b.duration, 10) || 1) * 60);
        return slot.startMin < bEnd && slot.endMin > bStart;
      });

      return {
        start: slot.start,
        end: slot.end,
        status: isBooked ? 'booked' : 'available',
        display: `${slot.start} – ${slot.end}`
      };
    });

    return res.status(200).json({
      success: true,
      workspaceId,
      date: dateStr,
      schedule
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error checking availability' });
  }
};

// @desc    Create new workspace (Admin)
// @route   POST /api/workspaces
exports.createWorkspace = async (req, res) => {
  try {
    const { name, type, description, location, pricePerHour, capacity, amenities } = req.body;
    const workspaceId = `WS-${Math.floor(100 + Math.random() * 900)}`;

    const newWs = await Workspace.create({
      workspaceId,
      name,
      type: type || 'Dedicated Desk',
      description: description || '',
      location: location || 'Downtown Executive Hub',
      pricePerHour: pricePerHour || 25.0,
      capacity: capacity || 1,
      amenities: amenities || ['WiFi', 'Coffee'],
      status: 'available'
    });

    return res.status(201).json({ success: true, message: 'Workspace created successfully', workspace: newWs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create workspace' });
  }
};

// @desc    Update workspace (Admin)
// @route   PUT /api/workspaces/:id
exports.updateWorkspace = async (req, res) => {
  try {
    const wsId = req.params.id;
    const updatedWs = await Workspace.findOneAndUpdate(
      { $or: [{ workspaceId: wsId }, { _id: wsId }] },
      { $set: req.body },
      { new: true }
    );

    return res.status(200).json({ success: true, message: 'Workspace updated', workspace: updatedWs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update workspace' });
  }
};

// @desc    Delete workspace (Admin)
// @route   DELETE /api/workspaces/:id
exports.deleteWorkspace = async (req, res) => {
  try {
    const wsId = req.params.id;
    await Workspace.deleteOne({ $or: [{ workspaceId: wsId }, { _id: wsId }] });
    return res.status(200).json({ success: true, message: 'Workspace removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete workspace' });
  }
};

exports.ensureSeedWorkspaces = ensureSeedWorkspaces;
exports.timeToMinutes = timeToMinutes;
