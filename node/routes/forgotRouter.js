const express = require('express');
const router = express.Router();
const forgotController = require('../controller/forgotController'); // Import the controller

// GET /login Route (Display login form)
router.get('/forgot', (req, res) => {
    res.render('forgot');
  });

// Handle sign-up form POST
router.post('/forgot-password', (req, res) => {
  console.log('Received a POST request to /forgot-password');
  loginController.postLogin(req, res); // fill this in with forgot password Form
});

module.exports = router;
