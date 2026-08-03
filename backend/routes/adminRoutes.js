const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const membershipController = require('../controllers/membershipController');
const contactController = require('../controllers/contactController');
const workspaceController = require('../controllers/workspaceController');
const paymentController = require('../controllers/paymentController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

// Dashboard Overview & Stats (Admin Only)
router.get('/dashboard/stats', authenticateUser, requireAdmin, adminController.getDashboardStats);
router.get('/stats', authenticateUser, requireAdmin, adminController.getDashboardStats);
router.get('/dashboard/revenue', authenticateUser, requireAdmin, adminController.getRevenueOverview);
router.get('/revenue-overview', authenticateUser, requireAdmin, adminController.getRevenueOverview);
router.get('/dashboard/weekly-bookings', authenticateUser, requireAdmin, adminController.getWeeklyBookings);
router.get('/weekly-bookings', authenticateUser, requireAdmin, adminController.getWeeklyBookings);

// Bookings Overview
router.get('/bookings', authenticateUser, requireAdmin, adminController.getAdminBookings);
router.post('/bookings', authenticateUser, requireAdmin, adminController.createAdminBooking);
router.get('/bookings/recent', authenticateUser, requireAdmin, adminController.getRecentBookings);
router.get('/recent-bookings', authenticateUser, requireAdmin, adminController.getRecentBookings);
router.put('/bookings/:id/status', authenticateUser, requireAdmin, adminController.updateBookingStatus);
router.delete('/bookings/:id', authenticateUser, requireAdmin, adminController.deleteBooking);

// Latest Payments
router.get('/payments/recent', authenticateUser, requireAdmin, adminController.getLatestPayments);
router.get('/payments', authenticateUser, requireAdmin, paymentController.getRecentPayments);

// User Management
router.get('/users', authenticateUser, requireAdmin, userController.getAllUsers);

// Workspace Management
router.get('/workspaces', workspaceController.getWorkspaces);
router.post('/workspaces', authenticateUser, requireAdmin, workspaceController.createWorkspace);
router.put('/workspaces/:id', authenticateUser, requireAdmin, workspaceController.updateWorkspace);
router.delete('/workspaces/:id', authenticateUser, requireAdmin, workspaceController.deleteWorkspace);

// Membership Management
router.get('/memberships', authenticateUser, requireAdmin, membershipController.getAdminMembershipBookings);

// Contact / Inquiry Management
router.get('/contact', authenticateUser, requireAdmin, contactController.getContactMessages);
router.put('/contact/:id', authenticateUser, requireAdmin, contactController.updateMessageStatus);

module.exports = router;
