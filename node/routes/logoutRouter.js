const express = require('express');
const router = express.Router();

// Logout Route (Handles user logout)
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Could not log out');
      }
  
      // Add success query parameter when redirecting to login
      res.redirect('/login?success=true');
    });
  });

module.exports = router;
