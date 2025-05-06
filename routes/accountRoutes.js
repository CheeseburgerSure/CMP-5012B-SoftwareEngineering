const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController.js');

console.log('accountController:', accountController);

router.get('/create-account', accountController.getRegister);
router.post('/createAccountForm', accountController.postRegister);

router.get('/verify', (req, res) => {
    res.render('verify');
});
router.post('/verify', accountController.verifyAccount);

module.exports = router;
