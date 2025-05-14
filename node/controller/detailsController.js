const pool = require('../db');
const bcrypt = require('bcrypt');
const { validatePassword } = require('../utils/validators.js');

// GET /details – render user details page
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
    const shortenedUserID = user.userid.slice(0, 8);

    res.render('details', {
      user: {
        id: shortenedUserID,
        email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      successMessage: req.session.successMessage,
      error: req.session.error
    });

    // Clear messages after rendering
    delete req.session.successMessage;
    delete req.session.error;

  } catch (err) {
    console.error(err);
    res.status(500).render('details', {
      user: null,
      error: 'Failed to load user details.'
    });
  }
};

// POST /details/change-details – handle updates
const updateUserDetails = async (req, res) => {
  try {
    const sessionEmail = req.session.user?.email;
    if (!sessionEmail) return res.redirect('/login');

    const { first_name, last_name, current_password, new_password, email } = req.body;

    const { rows } = await pool.query(
      'SELECT UserID, First_Name, Last_Name FROM "Users" WHERE Email = $1',
      [sessionEmail]
    );
    if (!rows.length) return res.redirect('/login');

    const user = rows[0];
    const shortenedUserID = user.userid.slice(0, 8);

    const setParts = [];
    const setValues = [];
    let idx = 1;

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

    if (email) {
      setParts.push(`Email = $${idx++}`);
      setValues.push(email);
      req.session.user.email = email;
    }

    if (new_password) {
      if (!current_password) {
        req.session.error = 'Current password is required.';
        return res.redirect('/details');
      }

      const pwRes = await pool.query('SELECT password_hash FROM "Users" WHERE Email = $1', [sessionEmail]);
      if (!pwRes.rows.length) {
        req.session.error = 'User not found.';
        return res.redirect('/details');
      }

      const isMatch = await bcrypt.compare(current_password, pwRes.rows[0].password_hash);
      if (!isMatch) {
        req.session.error = 'Current password is incorrect.';
        return res.redirect('/details');
      }

      const { isValid, errors } = validatePassword(new_password);
      if (!isValid) {
        req.session.error = errors.join(' ');
        return res.redirect('/details');
      }

      const hash = await bcrypt.hash(new_password, 10);
      setParts.push(`password_hash = $${idx++}`);
      setValues.push(hash);
    }

    if (!setParts.length) {
      req.session.error = 'Nothing to update.';
      return res.redirect('/details');
    }

    setValues.push(sessionEmail);
    const sql = `UPDATE "Users" SET ${setParts.join(', ')} WHERE Email = $${idx}`;
    const updateRes = await pool.query(sql, setValues);

    if (!updateRes.rowCount) {
      req.session.error = 'Update failed.';
      return res.redirect('/details');
    }

    req.session.successMessage = 'Your details were updated successfully.';
    return res.redirect('/details');

  } catch (err) {
    console.error('Error updating user:', err);
    req.session.error = 'Failed to update user details.';
    return res.redirect('/details');
  }
};

module.exports = { getDetailsPage, updateUserDetails };
