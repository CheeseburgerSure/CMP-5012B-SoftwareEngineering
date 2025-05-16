const pool = require('../db');

// Function for total user count
async function getTotalUserCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) AS count FROM "users"');
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
}

// renders the admin panel with user count
const renderAdminPanel = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.status(403).send('Admins only.');
  }
  try {
    const userCount = await getTotalUserCount();
    res.render('admin', { userCount });
  } catch (error) {
    console.error('Error rendering admin panel:', error);
    res.status(500).send('Server error');
  }
};

// loads the page where admins can view and edit users
const renderAdminUsers = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.status(403).send('Admins only.');
  }
  try {
    const result = await pool.query(
      'SELECT user_id, first_name, last_name, email, is_admin, is_banned FROM "users"'
    );
    const users = result.rows.map(user => ({
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      role: user.is_admin ? 'Admin' : 'User',
      status: user.is_banned ? 'Banned' : 'Active'
    }));
    res.render('adminUsers', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server error');
  }
};

// loads the page where admins can view and edit bookings
const renderAdminBookings = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.status(403).send('Admins only.');
  }
  try {
    const result = await pool.query(
      `SELECT b.booking_id, b.user_id, u.first_name, u.last_name
       FROM "bookings" b
       LEFT JOIN "users" u ON b.user_id = u.user_id
       ORDER BY b.booking_id DESC`
    );
    const bookings = result.rows.map(b => ({
      id: b.booking_id,
      user_id: b.user_id,
      user_name: `${b.first_name || ''} ${b.last_name || ''}`.trim()
    }));
    res.render('adminBookings', { bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send('Server error');
  }
};

// render the edit user page
const renderEditUser = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.status(403).send('Admins only.');
  }
  const userId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT user_id, email, first_name, last_name, is_banned FROM "users" WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    const user = result.rows[0];
    res.render('adminActions', {
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        status: user.is_banned ? 'Banned' : 'Active'
      }
    });
  } catch (error) {
    console.error('Error fetching user for edit:', error);
    res.status(500).send('Server error');
  }
};

// edit user handler
const postEditUser = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.status(403).send('Admins only.');
  }
  const userId = req.params.id;
  const { email, first_name, last_name, status } = req.body;
  try {
    await pool.query(
      'UPDATE "users" SET email = $1, first_name = $2, last_name = $3, is_banned = $4 WHERE user_id = $5',
      [
        email,
        first_name,
        last_name,
        status === 'Banned',
        userId
      ]
    );
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Server error');
  }
};

// check if the current session user is an admin
async function isUserAdmin(req) {
  if (!req.session || !req.session.user) return false;
  try {
    const result = await pool.query(
      'SELECT is_admin FROM "users" WHERE user_id = $1',
      [req.session.user.id]
    );
    return result.rows.length > 0 && result.rows[0].is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

module.exports = {
  renderAdminPanel,
  renderAdminUsers,
  renderEditUser,
  postEditUser,
  renderAdminBookings,
  isUserAdmin
};

