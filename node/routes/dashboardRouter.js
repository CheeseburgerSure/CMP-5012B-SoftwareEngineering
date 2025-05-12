const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

// Route for rendering the dashboard
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if the user is not logged in
  }
  // If user is logged in, render dashboard
  dashboardController.getDashboardData(req, res);
});

module.exports = router;
