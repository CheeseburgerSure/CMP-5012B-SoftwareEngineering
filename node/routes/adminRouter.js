const express = require('express');
const router = express.Router();

// GET /admin Route
router.get('/admin', (req, res) => {
    res.render('admin');
  });

router.get('/admin/users', (req, res) => {
    res.render('adminUsers');
  });

  router.get('/admin/bookings', (req, res) => {
    res.render('adminBookings');
  });

module.exports = router;