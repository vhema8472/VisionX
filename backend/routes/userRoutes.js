const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.get('/profile', authenticateUser, userController.getProfile);
router.put('/profile', authenticateUser, userController.updateProfile);
router.get('/me', authenticateUser, userController.getProfile);
router.put('/me', authenticateUser, userController.updateProfile);
router.get('/me/bookings', authenticateUser, bookingController.getUserBookings);
router.get('/me/payments', authenticateUser, userController.getUserPayments);
router.get('/me/memberships', authenticateUser, userController.getUserMemberships);
router.get('/', authenticateUser, requireAdmin, userController.getAllUsers);

module.exports = router;
