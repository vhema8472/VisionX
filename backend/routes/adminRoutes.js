const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const membershipController = require('../controllers/membershipController');
const contactController = require('../controllers/contactController');
const workspaceController = require('../controllers/workspaceController');
const paymentController = require('../controllers/paymentController');

// Dashboard Overview & Stats
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/stats', adminController.getDashboardStats);

// Bookings Overview (supports ?status=pending)
router.get('/bookings', adminController.getAdminBookings);
router.get('/bookings/recent', adminController.getRecentBookings);
router.get('/recent-bookings', adminController.getRecentBookings);
router.put('/bookings/:id/status', adminController.updateBookingStatus);
router.delete('/bookings/:id', adminController.deleteBooking);

// Latest Payments
router.get('/payments/recent', adminController.getLatestPayments);
router.get('/payments', paymentController.getRecentPayments);

// User Management
router.get('/users', userController.getAllUsers);

// Workspace Management
router.get('/workspaces', workspaceController.getWorkspaces);
router.post('/workspaces', workspaceController.createWorkspace);
router.put('/workspaces/:id', workspaceController.updateWorkspace);
router.delete('/workspaces/:id', workspaceController.deleteWorkspace);

// Membership Management
router.get('/memberships', membershipController.getAdminMembershipBookings);

// Contact / Inquiry Management
router.get('/contact', contactController.getContactMessages);
router.put('/contact/:id', contactController.updateMessageStatus);

module.exports = router;
