const express = require('express');
const router = express.Router();
const { getPaymentPage, postPay } = require('../controller/paymentController');

// Renders the payment page
router.get('/payment/:booking_id', getPaymentPage);
router.post('/payment/:booking_id', postPay);

module.exports = router;



