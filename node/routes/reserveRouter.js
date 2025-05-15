const express = require('express');
const router = express.Router();
const { getReservePage, postReserve } = require('../controller/reserveController');

router.get('/reserve', getReservePage); 
router.post('/reserve/submit', postReserve); 

module.exports = router;

