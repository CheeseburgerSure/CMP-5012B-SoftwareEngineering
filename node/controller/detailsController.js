const pool   = require('../db');
const bcrypt = require('bcrypt');

// GET /details  – render page
const getDetailsPage = async (req, res) => {
  try {
    if (!req.session.user?.email) return res.redirect('/login');

    const { email } = req.session.user;
    const { rows } = await pool.query(
      'SELECT First_Name, Last_Name FROM "Users" WHERE Email = $1',
      [email]
    );
    if (!rows.length) return res.redirect('/login');

    const dbUser = rows[0];
    res.render('details', {
      user: {
        email,
        first_name: dbUser.first_name,
        last_name: dbUser.last_name
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
    const { first_name, last_name, password, email } = req.body; // email is optional if you allow changing email

    /* ---- assemble dynamic update ---- */
    const setParts  = [];
    const setValues = [];
    let   idx       = 1;

    if (first_name) {
      setParts.push(`First_Name = $${idx++}`);
      setValues.push(first_name);
      req.session.user.first_name = first_name;
    }
    if (last_name) {
      setParts.push(`Last_Name = $${idx++}`);
      setValues.push(last_name);
      req.session.user.last_name = last_name;
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      setParts.push(`"password_hash" = $${idx++}`);
      setValues.push(hash);
    }
    if (email) {
      setParts.push(`Email = $${idx++}`);
      setValues.push(email);
      req.session.user.email = email;
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
