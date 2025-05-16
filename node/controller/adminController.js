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

// Function for total booking count
async function getTotalBookingCount() {
  try {
    const result = await pool.query('SELECT COUNT(*) AS count FROM "bookings"');
    return parseInt(result.rows[0].count, 10);
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
}

// renders the admin panel with user count
const renderAdminPanel = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.redirect('/login');
  }
  try {
    const userCount = await getTotalUserCount();
    const bookingCount = await getTotalBookingCount();
    res.render('admin', { userCount, bookingCount});
  } catch (error) {
    console.error('Error rendering admin panel:', error);
    res.status(500).send('Server error');
  }
};

// loads the page where admins can view and edit users
const renderAdminUsers = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.redirect('/login');
  }
  try {
    const result = await pool.query(
      'SELECT user_id, first_name, last_name, email, is_admin, is_banned, balance FROM "users"'
    );
    const users = result.rows.map(user => ({
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      role: user.is_admin ? 'Admin' : 'User',
      status: user.is_banned ? 'Banned' : 'Active',
      balance: user.balance
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
    return res.redirect('/login');
  }
  try {
    const result = await pool.query(
      `SELECT b.booking_id, b.user_id, u.first_name, u.last_name,
        b.location, b.time_booked_for, b.booking_date, b.price, b.booking_paid
        FROM "bookings" b
        LEFT JOIN "users" u ON b.user_id = u.user_id
        ORDER BY b.booking_id DESC`
    );
    const bookings = result.rows.map(b => ({
      id: b.booking_id,
      user_id: b.user_id,
      user_name: `${b.first_name || ''} ${b.last_name || ''}`.trim(),
      location: b.location,
      time_booked_for: b.time_booked_for,
      booking_date: b.booking_date,
      price: b.price,
      booking_paid: b.booking_paid
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
    return res.redirect('/login');
  }
  const userId = req.params.id;
  try {
    const result = await pool.query(
      'SELECT user_id, email, first_name, last_name, is_banned, balance FROM "users" WHERE user_id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    const user = result.rows[0];

    // Fetch bookings for this user if needed, or just pass an empty array
    let bookings = [];
    try {
      const bookingsResult = await pool.query(
        'SELECT * FROM "bookings" WHERE user_id = $1',
        [userId]
      );
      bookings = bookingsResult.rows || [];
    } catch (err) {
      bookings = [];
    }

    res.render('adminActions', {
      user: {
        id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        balance: user.balance,
        status: user.is_banned ? 'Banned' : 'Active'
      },
      bookings
    });
  } catch (error) {
    console.error('Error fetching user for edit:', error);
    res.status(500).send('Server error');
  }
};

// edit user handler
const postEditUser = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.redirect('/login');
  }
  const userId = req.params.id;
  const { email, first_name, last_name, status, balance } = req.body;
  try {
    await pool.query(
      'UPDATE "users" SET email = $1, first_name = $2, last_name = $3, is_banned = $4, balance = $5 WHERE user_id = $6',
      [
        email,
        first_name,
        last_name,
        status === 'Banned',
        balance,
        userId
      ]
    );
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Server error');
  }
};

// booking editor
const renderEditBooking = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.redirect('/login');
  }
  const bookingId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT b.booking_id, b.user_id, u.first_name, u.last_name,
       b.location, b.time_booked_for, b.booking_date, b.price, b.booking_paid
       FROM "bookings" b
       LEFT JOIN "users" u ON b.user_id = u.user_id
       WHERE b.booking_id = $1`, [bookingId]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('Booking not found');
    }
    const booking = result.rows[0];
    res.render('bookingActions', { 
      booking: {
        id: booking.booking_id,
        user_id: booking.user_id,
        user_name: `${booking.first_name || ''} ${booking.last_name || ''}`.trim(),
        location: booking.location,
        time_booked_for: booking.time_booked_for,
        booking_date: booking.booking_date,
        price: booking.price,
        booking_paid: booking.booking_paid
      }
    });
  } catch (error) {
    console.error('Error fetching booking for edit:', error);
    res.status(500).send('Server error');
  }
};

// post booking handler
const postEditBooking = async (req, res) => {
  if (!(await isUserAdmin(req))) {
    return res.redirect('/login');
  }
  const bookingId = req.params.id;
  const { user_id, location, booking_date, time_booked_for, price, booking_paid } = req.body;
  try {
    await pool.query(
      `UPDATE "bookings"
       SET user_id = $1, location = $2, booking_date = $3, time_booked_for = $4, price = $5, booking_paid = $6
       WHERE booking_id = $7`,
      [
        user_id,
        location,
        booking_date,
        time_booked_for,
        price,
        booking_paid === 'true',
        bookingId
      ]
    );
    res.redirect('/admin/bookings');
  } catch (error) {
    console.error('Error updating booking:', error);
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
  isUserAdmin,
  renderEditBooking,
  postEditBooking
};

