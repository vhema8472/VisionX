const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/', membershipController.getMembershipPlans);
router.post('/book', authenticateUser, membershipController.createMembershipBooking);

module.exports = router;
