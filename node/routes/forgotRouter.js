const express = require('express');
const router = express.Router();
const forgotController = require('../controller/forgotController');

// get forgot password
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
  });

// Handle sign-up form
router.post('/forgot-password', (req, res) => {
  console.log('Received a POST request to /forgot-password');
  forgotController.postForgot(req, res);
});

module.exports = router;
