const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');


router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  // If user is logged in, render dashboard
  dashboardController.getDashboardData(req, res);
});

module.exports = router;