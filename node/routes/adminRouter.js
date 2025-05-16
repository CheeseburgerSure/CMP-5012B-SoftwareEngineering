const express = require('express');
const router = express.Router();
const {
  renderAdminPanel,
  renderAdminUsers,
  renderEditUser,
  postEditUser,
  renderAdminBookings,
  renderEditBooking,
  postEditBooking,
  searchAdminUsers,
  searchAdminBookings
} = require('../controller/adminController');
const pool = require('../db');

// Dashboard route
const renderDashboard = async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }
  try {
    const result = await pool.query(
      'SELECT is_admin, first_name, balance FROM "users" WHERE user_id = $1',
      [req.session.user.id]
    );
    const user = result.rows[0];
    const first_name = user && user.first_name;
    const balance = user && user.balance ? user.balance : 0;
    const sessions = 0;
    const isAdmin = !!user.is_admin;
    res.render('dashboard', { isAdmin, first_name, balance, sessions });
  } catch (error) {
    console.error('Error fetching admin status:', error);
    res.status(500).send('Server error');
  }
};

module.exports = { renderDashboard, renderAdminPanel };

// Admin routes
router.get('/admin', renderAdminPanel);
router.get('/admin/users', renderAdminUsers);
router.get('/admin/users/:id/edit', renderEditUser);
router.post('/admin/users/:id/edit', postEditUser);
router.get('/admin/bookings', renderAdminBookings);
router.get('/admin/bookings/:id/edit', renderEditBooking);
router.post('/admin/bookings/:id/edit', postEditBooking);
router.get('/admin/users/search', searchAdminUsers);
router.get('/admin/bookings/search', searchAdminBookings);

module.exports = router;