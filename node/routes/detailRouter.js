const express = require('express');
const router = express.Router();
const detailsController = require('../controller/detailsController');

// Route for rendering the change details page
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect if no session exists
  }

  // If user is logged in, render the change details page
  const user = req.session.user;
  const isAdmin = !!user.is_admin;
  const first_name = user.first_name;
  const balance = user.balance;
  const sessions = user.sessions;
  res.render('dashboard', { isAdmin, first_name, balance, sessions });
});

router.post('/change-details', detailsController.updateUserDetails);

module.exports = router;
