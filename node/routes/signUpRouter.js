const express = require('express');
const signUpController = require('../controller/signUpController'); // Import the controller
const router = express.Router();

// GET route to render the sign-up page
router.get('/create-account', (req, res) => {
  res.render('create-account'); // Render the create-account page
});

// Handle sign-up form POST
router.post('/createAccountForm', (req, res) => {
  console.log('Received a POST request to /createAccountForm');
  signUpController.postRegister(req, res);
});


module.exports = router;
