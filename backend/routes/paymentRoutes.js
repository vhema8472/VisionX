const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.post('/create', authenticateUser, paymentController.createPayment);
router.post('/process', authenticateUser, paymentController.createPayment);
router.post('/confirm', authenticateUser, paymentController.createPayment);
router.post('/verify', paymentController.verifyPayment);
router.get('/:id', paymentController.getPaymentById);
router.get('/', paymentController.getRecentPayments);

module.exports = router;
