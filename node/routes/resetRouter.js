const express = require('express');
const router = express.Router();
const { getResetPage, postResetPassword } = require('../controller/resetController.js');  // Import your reset password controller

// GET /reset-password – show reset password form
router.get('/reset-password', getResetPage);

// POST /reset-password – process password reset
router.post('/reset-password', postResetPassword);

module.exports = router;
