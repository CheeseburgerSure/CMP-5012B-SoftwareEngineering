const express = require('express');
const router = express.Router();
const loginController = require('../controller/loginController'); 

// Route for rendering the login page
router.get('/login', (req, res) => {
    const successMessage = req.query.success ? 'You have successfully logged out!' : null;
    res.render('login', { successMessage });
  });

// Handle sign-up form POST
router.post('/login', (req, res) => {
  console.log('Received a POST request to /login');
  loginController.postLogin(req, res);
});

module.exports = router;
