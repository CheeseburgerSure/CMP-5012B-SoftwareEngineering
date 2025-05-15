const express = require('express');
const router = express.Router();
const { renderAdminPanel } = require('../controller/adminController');

// GET /admin Route with user count
router.get('/admin', renderAdminPanel);

router.get('/admin/users', (req, res) => {
    res.render('adminUsers');
});

router.get('/admin/bookings', (req, res) => {
    res.render('adminBookings');
});

module.exports = router;