const pool = require('../db');

// GET /admin Route
router.get('/admin', (req, res) => {
    res.render('admin');
  });

