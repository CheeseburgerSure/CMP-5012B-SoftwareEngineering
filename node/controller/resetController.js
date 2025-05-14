const pool = require('../db');
const bcrypt = require('bcrypt');
const { validatePassword } = require('../utils/validators');

// GET: Render reset password page
const getResetPage = async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).render('reset-password', {
      error: 'Reset token is missing.',
      token: null
    });
  }

  try {
    // Check password_reset_tokens table
    const { rows } = await pool.query(
      'SELECT * FROM "password_reset_tokens" WHERE token = $1 AND expires_at > $2',
      [token, new Date()]
    );

    if (!rows.length) {
      return res.status(400).render('reset-password', {
        error: 'Invalid or expired reset token.',
        token: null
      });
    }

    return res.render('reset-password', { error: null, token });
  } catch (err) {
    console.error('Error loading reset page:', err);
    return res.status(500).render('reset-password', {
      error: 'Error loading password reset page.',
      token: null
    });
  }
};

// POST: Handle password reset
const postResetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    const { rows } = await pool.query(
      'SELECT * FROM "password_reset_tokens" WHERE token = $1 AND expires_at > $2',
      [token, new Date()]
    );

    if (!rows.length) {
      return res.status(400).render('reset-password', {
        error: 'Invalid or expired reset token.',
        token
      });
    }

    const userId = rows[0].user_id;

    const { isValid, errors } = validatePassword(newPassword);
    if (!isValid) {
      return res.status(400).render('reset-password', {
        error: errors.join(' '),
        token
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).render('reset-password', {
        error: 'Passwords do not match.',
        token
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE "users" SET password_hash = $1 WHERE user_id = $2',
      [hashedPassword, userId]
    );

    await pool.query(
      'DELETE FROM "password_reset_tokens" WHERE token = $1',
      [token]
    );

    return res.render('login', { success: 'Password successfully reset. Please log in.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    return res.status(500).render('reset-password', {
      error: 'Internal server error while resetting password.',
      token
    });
  }
};

module.exports = { getResetPage, postResetPassword };
