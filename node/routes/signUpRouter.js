const express = require('express');
const signUpController = require('../controller/signUpController');
const router = express.Router();

//render the sign-up page
router.get('/create-account', (req, res) => {
  res.render('create-account'); // Render the create-account page
});

// Handle sign-up form
router.post('/createAccountForm', (req, res) => {
  console.log('Received a POST request to /createAccountForm');
  signUpController.postRegister(req, res);
});


module.exports = router;
