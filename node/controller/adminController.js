const pool = require('../db');

// Function to get total user count
async function getTotalUserCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) AS count FROM "users"');
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
}

// Controller to render admin panel with user count
const renderAdminPanel = async (req, res) => {
  try {
    const userCount = await getTotalUserCount();
    res.render('admin', { userCount });
  } catch (error) {
    console.error('Error rendering admin panel:', error);
    res.status(500).send('Server error');
  }
};

module.exports = { renderAdminPanel };

