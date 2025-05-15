const express = require('express');
const router = express.Router();
const { getReservePage, postReserve } = require('../controller/reserveController');

// render the reserve page
router.get('/reserve', getReservePage); 
router.post('/reserve/submit', postReserve); 

module.exports = router;