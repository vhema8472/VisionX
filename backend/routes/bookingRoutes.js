const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/', authenticateUser, bookingController.createBooking);
router.get('/', authenticateUser, bookingController.getUserBookings);
router.get('/my', authenticateUser, bookingController.getUserBookings);
router.get('/:id', bookingController.getBookingById);

module.exports = router;
