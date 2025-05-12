const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

// Route for rendering the dashboard
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if the user is not logged in
  }
  // Assuming `req.session.user` contains user data
  res.render('dashboard', { user: req.session.user });
});

// Additional routes for dashboard-related actions
// Example: Fetch user details, update balance, etc.
router.get('/settings', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('settings', { user: req.session.user });
});

module.exports = router;
