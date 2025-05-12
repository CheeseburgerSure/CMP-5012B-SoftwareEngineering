const pool = require('../db');

// Fetch user details for dashboard
const getDashboardData = async (req, res) => {
  try {
    const { email } = req.session.user; // Assuming the user email is stored in the session
    const result = await pool.query('SELECT First_Name, Last_Name, Balance FROM "Users" WHERE Email = $1', [email]);

    if (result.rows.length === 0) {
      return res.redirect('/login'); // If no user found, redirect to login
    }

    const user = result.rows[0]; // Get user details

    // Ensure balance is a number, default to 0 if undefined
    const balance = user.Balance !== null && user.Balance !== undefined ? user.Balance : 0;

    // Log the user data to check if it exists
    console.log('User data:', user);

    // Render dashboard and pass user details (name, balance)
    res.render('dashboard', {
      user: req.session.user,  // pass full user data for the dashboard
      firstName: user.first_name,
      lastName: user.last_name,
      balance: balance.toFixed(2), // Format balance as a decimal (e.g., 50.00)
      sessions: 2 // Example session count, replace with actual session data
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).render('dashboard', { error: 'Error loading dashboard data. Please try again.' });
  }
};

module.exports = { getDashboardData };
