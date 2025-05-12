const express = require('express');
const router = express.Router();
const detailsController = require('../controller/detailsController');

// Route for rendering the change details page
router.get('/', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect if no session exists
  }

  // If user is logged in, render the change details page
  detailsController.getDetailsPage(req, res);
});

router.post('/change-details', detailsController.updateUserDetails);

module.exports = router;
