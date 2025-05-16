const pool = require('../db');
const crypto = require('crypto');
const { sendForgotPassword } = require('../controller/email');

const postForgot = async (req, res) => {
  const { email } = req.body;

  try {
    const { rows } = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);

    if (rows.length === 0) {
      return res.status(400).render('forgot-password', {
        error: 'Email not found in our records.',
      });
    }

    const user = rows[0];
    const userId = user.user_id;
    const firstName = user.first_name;

    // Check reset attempts
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const { rows: attempts } = await pool.query(
          'SELECT * FROM "password_reset_attempts" WHERE user_id = $1 AND timestamp > $2',
          [userId, twentyFourHoursAgo]
    );

    // check amount of attempts 
    if (attempts.length >= 3) {
      await pool.query(
        'UPDATE "users" SET is_banned = true WHERE user_id = $1',
        [userId]
    );

      return res.status(400).render('forgot-password', {
        error: 'You have made too many reset attempts. Your account is temporarily banned.',
      });
    }

    // cooldown for password reset
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const recentAttempts = await pool.query(
      'SELECT * FROM "password_reset_attempts" WHERE user_id = $1 AND timestamp > $2',
      [userId, fiveMinutesAgo]
    );

    if (recentAttempts.length > 0) {
      return res.status(400).render('forgot-password', {
        error: 'Please wait 5 minutes before trying again.',
      });
    }

    // Generate secure token & expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // an hour

    // Append token to Database
    await pool.query(
      'INSERT INTO "password_reset_tokens" (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, token, expiresAt]
    );

    // Send reset email with link
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    await sendForgotPassword(email, resetLink, firstName);

    await pool.query(
      'INSERT INTO "password_reset_attempts" (user_id, timestamp) VALUES ($1, $2)',
      [userId, now]
    );

    res.render('forgot-password', {
      success: 'Password reset email has been sent. Please check your inbox.',
    });

  } catch (err) {
    console.error('Error processing forgot password:', err);
    res.status(500).render('forgot-password', {
      error: 'There was an error processing your request. Please try again later.'
    });
  }
};

module.exports = { postForgot };
