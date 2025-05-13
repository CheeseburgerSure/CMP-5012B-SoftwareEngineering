const express = require('express');
const router = express.Router();
const { postAddBalance } = require('../controller/balanceController');

router.post('/add-balance', postAddBalance);

module.exports = router;
