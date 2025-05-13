const pool   = require('../db');
const bcrypt = require('bcrypt');
const { validatePassword } = require('../utils/validators.js');

// GET /details  – render page
const getDetailsPage = async (req, res) => {
  try {
    if (!req.session.user?.email) return res.redirect('/login');

    const { email } = req.session.user;
    const { rows } = await pool.query(
      'SELECT UserID, First_Name, Last_Name FROM "Users" WHERE Email = $1',
      [email]
    );
    if (!rows.length) return res.redirect('/login');

    const user = rows[0];

    // Shorten UserID, take in the first 8 char
    const shortenedUserID = user.userid.slice(0, 8);

    res.render('details', {
      user: {
        id: shortenedUserID,
        email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('details', { error: 'Failed to load user details.' });
  }
};

// POST /details/change-details  – update info
const updateUserDetails = async (req, res) => {
  try {
    const sessionEmail          = req.session.user.email;

    const { first_name, last_name, current_password, new_password, email } = req.body;

    const setParts  = [];
    const setValues = [];
    let   idx       = 1;


    // First Name
    if (first_name) {
      setParts.push(`First_Name = $${idx++}`);
      setValues.push(first_name);
      req.session.user.first_name = first_name;
    }

    // Last Name
    if (last_name) {
      setParts.push(`Last_Name = $${idx++}`);
      setValues.push(last_name);
      req.session.user.last_name = last_name;
    }

    // Email Address
    if (email) {
      setParts.push(`Email = $${idx++}`);
      setValues.push(email);
      req.session.user.email = email;
    }

    // Password Update
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required.' });
      }

      // Get current password from DB
      const { rows } = await pool.query('SELECT password_hash FROM "Users" WHERE Email = $1', [sessionEmail]);
      if (!rows.length) {
        return res.status(400).json({ error: 'User not found.' }); // DB Unable to obtain password
      }

      // Current password checker
      const isMatch = await bcrypt.compare(current_password, rows[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect.' }); // Wrong password
      }

      const { isValid, errors } = validatePassword(new_password);
      if (!isValid) {
        return res.status(400).json({ error: errors.join(' ') });
      }

      // Hash and store new password
      const hash = await bcrypt.hash(new_password, 10);
      setParts.push(`"password_hash" = $${idx++}`);
      setValues.push(hash);
    }

    if (!setParts.length) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    // WHERE clause value
    setValues.push(sessionEmail);

    const sql = `UPDATE "Users" SET ${setParts.join(', ')} WHERE Email = $${idx}`;
    const { rowCount } = await pool.query(sql, setValues);

    if (!rowCount) {
      return res.status(400).render('details', { error: 'Update failed.' });
    }

    res.redirect('/details');
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).render('details', { error: 'Failed to update user details.' });
  }
};

module.exports = { getDetailsPage, updateUserDetails };
