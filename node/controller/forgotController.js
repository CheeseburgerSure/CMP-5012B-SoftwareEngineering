const pool = require('../db');
const { sendForgotPassword } = require('../controller/email');  // Import the sendForgotPassword function

const postForgot = async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the email exists in the database
    const { rows } = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);

    if (rows.length === 0) {
      return res.status(400).render('forgot-password', {
        error: 'Email not found in our records.',
      });
    }

    // Check if the user has made more than 3 requests in the last 24 hours
    const user = rows[0];
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { rows: attempts } = await pool.query(
      'SELECT * FROM "password_reset_attempts" WHERE email = $1 AND timestamp > $2',
      [email, twentyFourHoursAgo]
    );

    if (attempts.length >= 3) {
      // Ban the user for 24 hours
      await pool.query(
        'UPDATE "user" SET is_banned = true WHERE email = $1',
        [email]
      );

      return res.status(400).render('forgot-password', {
        error: 'You have made too many reset attempts. Your account is temporarily banned.',
      });
    }

    // Check if the user has made a request in the last 5 minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const recentAttempts = await pool.query(
      'SELECT * FROM "password_reset_attempts" WHERE email = $1 AND timestamp > $2',
      [email, fiveMinutesAgo]
    );

    if (recentAttempts.length > 0) {
      return res.status(400).render('forgot-password', {
        error: 'Please wait 5 minutes before trying again.',
      });
    }

    // Generate a password reset token (you can also use a random code here if preferred)
    const resetCode = Math.floor(100000 + Math.random() * 900000); // Generate a random 6-digit code

    // Send the email with the token and reset code
    const firstName = user.FirstName;  // Assume "FirstName" is a column in your "Users" table
    await sendForgotPassword(email, resetCode, firstName);

    // Log the reset attempt
    await pool.query(
      'INSERT INTO "password_reset_attempts" (email, timestamp) VALUES ($1, $2)',
      [email, now]
    );

    res.render('forgot-password', {
      success: 'Password reset email has been sent. Please check your inbox.',
    });

  } catch (err) {
    console.error('Error processing forgot password:', err);
    res.status(500).render('forgot-password', { error: 'There was an error processing your request. Please try again later.' });
  }
};

module.exports = { postForgot };
