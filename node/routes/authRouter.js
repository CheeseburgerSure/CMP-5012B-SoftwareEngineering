const express = require('express');
const router = express.Router();
const verifyController = require('../controller/verifyController');

// GET route to render the verify page
router.get('/verify', (req, res) => {
  verifyController.getVerifyPage(req, res);
});

// Handle verify form POST
router.post('/verify', (req, res) => {
  console.log('Received a POST request to /verify');
  verifyController.postVerify(req, res);
});

module.exports = router;
