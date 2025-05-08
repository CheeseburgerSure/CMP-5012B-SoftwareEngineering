const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController.js');

router.get('/create-account', accountController.getRegister);
router.post('/createAccountForm', accountController.postRegister);

// GET /verify (Verification page for email and code from URL query parameters)
router.get('/verify', accountController.getVerify); // Handle the verification page logic

// POST /verify (When users manually enter the verification code on the form)
router.post('/verify', accountController.verifyAccount);

module.exports = router;
