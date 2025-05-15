const pool = require('../db');

// Fetch user details for dashboard
const getDashboardData = async (req, res) => {
  try {
      if (!req.session.user?.email) return res.redirect('/login');

      const { email } = req.session.user;
      const { rows } = await pool.query(
        'SELECT first_name, last_name, balance FROM "users" WHERE email = $1',
        [email]
      );

      if (!rows.length) return res.redirect('/login');
      
      const user = rows[0];

    // Log the user data to check if it exists
    console.log('User data:', user);

    // Render dashboard
    res.render('dashboard', {
      user: req.session.user,
      first_name: user.first_name,
      last_name: user.last_name,
      balance: user.balance,
      sessions: 2
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('dashboard', { error: 'Error loading dashboard data. Please try again.' });
  }
};

module.exports = { getDashboardData };