const Booking = require('../models/Booking');
const Workspace = require('../models/Workspace');
const Payment = require('../models/Payment');

// Helper to convert time string to minutes from midnight
const timeToMin = (tStr) => {
  if (!tStr) return 0;
  const match = tStr.trim().toUpperCase().match(/(\d+):(\d+)\s*(AM|PM)?/);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3];

  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

// Helper to calculate End Time from Start Time and Duration Hours
const calculateEndTimeString = (startTimeStr, durationHours) => {
  const startMin = timeToMin(startTimeStr);
  const endMin = startMin + durationHours * 60;

  let endH = Math.floor(endMin / 60);
  const endM = endMin % 60;
  const ampm = endH >= 12 ? 'PM' : 'AM';
  let formattedH = endH % 12;
  if (formattedH === 0) formattedH = 12;

  const formattedMStr = String(endM).padStart(2, '0');
  const formattedHStr = String(formattedH).padStart(2, '0');
  return `${formattedHStr}:${formattedMStr} ${ampm}`;
};

// Shared memory store for instant fallback & initial seed
const initialSeedBookings = [
  { bookingId: 'BK-9901', userId: 'USR-101', userName: 'Alex Johnson', userEmail: 'alex.johnson@cloudscale.ai', workspaceId: 'WS-001', workspaceName: 'Desk #03', workspaceType: 'Dedicated Desk', date: '2026-08-01', startTime: '09:00 AM', endTime: '05:00 PM', duration: '8 Hours', hourlyRate: 25.0, subtotal: 200.0, serviceFee: 20.0, totalAmount: 220.0, bookingStatus: 'confirmed', paymentStatus: 'paid', createdAt: new Date(Date.now() - 3600000 * 4) },
  { bookingId: 'BK-9902', userId: 'USR-106', userName: 'Sophia Taylor', userEmail: 'sophia.taylor@designlab.io', workspaceId: 'WS-002', workspaceName: 'Cabin A', workspaceType: 'Private Cabin', date: '2026-08-01', startTime: '10:30 AM', endTime: '02:30 PM', duration: '4 Hours', hourlyRate: 45.0, subtotal: 180.0, serviceFee: 18.0, totalAmount: 198.0, bookingStatus: 'confirmed', paymentStatus: 'paid', createdAt: new Date(Date.now() - 3600000 * 3) },
  { bookingId: 'BK-9903', userId: 'USR-107', userName: 'James Wilson', userEmail: 'james.wilson@nexus.co', workspaceId: 'WS-003', workspaceName: 'Room 102', workspaceType: 'Meeting Room', date: '2026-08-01', startTime: '01:00 PM', endTime: '03:00 PM', duration: '2 Hours', hourlyRate: 75.0, subtotal: 150.0, serviceFee: 15.0, totalAmount: 165.0, bookingStatus: 'pending', paymentStatus: 'paid', createdAt: new Date(Date.now() - 3600000 * 2) },
  { bookingId: 'BK-9904', userId: 'USR-103', userName: 'David Chen', userEmail: 'david.chen@fintech.org', workspaceId: 'WS-004', workspaceName: 'Desk #01', workspaceType: 'Hot Desk', date: '2026-08-01', startTime: '02:15 PM', endTime: '06:15 PM', duration: '4 Hours', hourlyRate: 15.0, subtotal: 60.0, serviceFee: 6.0, totalAmount: 66.0, bookingStatus: 'confirmed', paymentStatus: 'paid', createdAt: new Date(Date.now() - 3600000 * 1) }
];

const sharedBookingsStore = [...initialSeedBookings];

const ensureSeedBookings = async () => {
  if (require('mongoose').connection.readyState !== 1) return;
  try {
    const count = await Booking.countDocuments();
    if (count === 0) {
      await Booking.insertMany(initialSeedBookings);
      console.log('🌱 Seeded initial bookings into MongoDB collection "bookings".');
    }
  } catch (err) {}
};

// @desc    Create new workspace booking (with double-booking check & server price calculation)
// @route   POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const {
      bookingId,
      userId,
      workspaceId,
      deskId,
      userName,
      user,
      userEmail,
      workspaceName,
      workspaceType,
      title,
      deskType,
      date,
      bookingDate,
      startTime,
      arrivalTime,
      timeSlot,
      endTime,
      duration,
      durationHours,
      hourlyRate,
      specialRequest
    } = req.body;

    const finalUserId = (req.user && req.user.userId) ? req.user.userId : (userId || 'USR-GUEST');
    const finalUserName = (userName || user || (req.user && req.user.name) || '').trim();
    if (!finalUserName) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your name.'
      });
    }

    const finalUserEmail = (req.user && req.user.email) ? req.user.email : (userEmail || '');
    const finalDeskId = deskId || workspaceId || 'D-101';
    const finalWorkspaceId = workspaceId || finalDeskId || 'WS-001';
    const finalWorkspaceName = workspaceName || title || `Desk (${finalDeskId})`;
    const finalWorkspaceType = workspaceType || deskType || 'Hot Desk';

    const finalDate = date || bookingDate || new Date().toISOString().split('T')[0];
    
    let finalStartTime = startTime || arrivalTime;
    if (!finalStartTime && timeSlot) {
      finalStartTime = timeSlot.split('–')[0].trim();
    }
    if (!finalStartTime) finalStartTime = '10:00 AM';

    // Calculate duration in hours
    let parsedDurationHours = parseInt(durationHours || duration, 10);
    if (isNaN(parsedDurationHours) || parsedDurationHours <= 0) {
      parsedDurationHours = 1;
    }

    const finalDurationStr = `${parsedDurationHours} ${parsedDurationHours === 1 ? 'Hour' : 'Hours'}`;
    const finalEndTime = endTime || calculateEndTimeString(finalStartTime, parsedDurationHours);

    // Fetch workspace hourly rate
    let calculatedRate = parseFloat(hourlyRate);
    if (isNaN(calculatedRate)) {
      try {
        const ws = await Workspace.findOne({ workspaceId: finalWorkspaceId });
        calculatedRate = ws ? ws.pricePerHour : 25.0;
      } catch (e) {
        calculatedRate = 25.0;
      }
    }

    // Backend price calculations
    const subtotal = Math.round(calculatedRate * parsedDurationHours * 100) / 100;
    const serviceFee = Math.round(subtotal * 0.10 * 100) / 100; // 10% service fee
    const totalAmount = Math.round((subtotal + serviceFee) * 100) / 100;

    const reqStartMin = timeToMin(finalStartTime);
    const reqEndMin = timeToMin(finalEndTime);

    // ==========================================
    // PREVENT DOUBLE BOOKING (SLOT OVERLAP CHECK)
    // ==========================================
    let existingBookings = sharedBookingsStore.filter(b => 
      (b.deskId === finalDeskId || b.workspaceId === finalWorkspaceId || b.workspaceName === finalWorkspaceName) &&
      (b.date === finalDate || b.bookingDate === finalDate) &&
      b.bookingStatus !== 'cancelled'
    );

    if (require('mongoose').connection.readyState === 1) {
      try {
        const mongoBookings = await Booking.find({
          $or: [{ deskId: finalDeskId }, { workspaceId: finalWorkspaceId }, { workspaceName: finalWorkspaceName }],
          $or: [{ date: finalDate }, { bookingDate: finalDate }],
          bookingStatus: { $ne: 'cancelled' }
        });
        if (mongoBookings && mongoBookings.length > 0) {
          existingBookings = mongoBookings;
        }
      } catch (checkErr) {}
    }

    const hasOverlap = existingBookings.some(b => {
      const bStart = timeToMin(b.startTime || b.arrivalTime);
      const bEnd = timeToMin(b.endTime) || (bStart + (parseInt(b.duration, 10) || 1) * 60);
      return reqStartMin < bEnd && reqEndMin > bStart;
    });

    if (hasOverlap) {
      console.warn(`❌ Double booking rejected (409 Conflict): Desk ${finalDeskId} on ${finalDate} at ${finalStartTime}`);
      return res.status(409).json({
        success: false,
        message: 'This desk is no longer available for the selected time.'
      });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase().padStart(4, '0');
    const finalBookingId = bookingId || `BK-${dateStr}-${randomHex}`;
    const paymentId = `PAY-${dateStr}-${randomHex}`;

    const newBookingDoc = {
      bookingId: finalBookingId,
      userId: finalUserId,
      deskId: finalDeskId,
      workspaceId: finalWorkspaceId,
      userName: finalUserName,
      userEmail: finalUserEmail,
      workspaceName: finalWorkspaceName,
      workspaceType: finalWorkspaceType,
      bookingType: 'desk',
      date: finalDate,
      startTime: finalStartTime,
      endTime: finalEndTime,
      duration: finalDurationStr,
      hourlyRate: calculatedRate,
      subtotal,
      serviceFee,
      totalAmount,
      specialRequest: specialRequest || '',
      paymentId,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      createdBy: 'user',
      createdAt: new Date()
    };

    // Always unshift into shared store for instant availability & admin queries
    sharedBookingsStore.unshift(newBookingDoc);

    let savedBooking;
    try {
      savedBooking = await Booking.create(newBookingDoc);
      
      // Also create payment record
      await Payment.create({
        paymentId,
        bookingId: finalBookingId,
        userId: finalUserId,
        amount: totalAmount,
        currency: 'USD',
        paymentMethod: 'Credit Card',
        status: 'paid'
      });
      console.log('✅ Booking & Payment created in MongoDB:', finalBookingId);
    } catch (dbErr) {
      savedBooking = newBookingDoc;
    }

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      bookingId: finalBookingId,
      booking: savedBooking
    });

  } catch (error) {
    console.error('Create Booking Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// @desc    Get user's personal booking history
// @route   GET /api/users/me/bookings or /api/bookings/my
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : '';
    const userEmail = req.user ? req.user.email : '';

    let bookings = [];
    if (require('mongoose').connection.readyState === 1) {
      try {
        bookings = await Booking.find({
          $or: [{ userId }, { userEmail }]
        }).sort({ createdAt: -1 });
      } catch (e) {}
    }

    if ((!bookings || bookings.length === 0) && sharedBookingsStore) {
      bookings = sharedBookingsStore.filter(b => 
        (userId && b.userId === userId) || (userEmail && b.userEmail === userEmail)
      );
    }

    return res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user bookings' });
  }
};

// @desc    Get single booking details
// @route   GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findOne({ $or: [{ bookingId }, { _id: bookingId }] });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving booking' });
  }
};

exports.sharedBookingsStore = sharedBookingsStore;
exports.getSharedBookings = () => sharedBookingsStore;
exports.ensureSeedBookings = ensureSeedBookings;
