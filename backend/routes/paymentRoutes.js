const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create', paymentController.createPayment);
router.post('/verify', paymentController.verifyPayment);
router.get('/:id', paymentController.getPaymentById);
router.get('/', paymentController.getRecentPayments);

module.exports = router;
