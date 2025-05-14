const pool = require('../db');
const { validatePassword } = require('../utils/validators'); // Import the validatePassword function

const resetPassword = async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  try {
    // Check if the token exists in the EmailVerificationTokens table
    const { rows } = await pool.query(
      'SELECT * FROM "PasswordResetTokens" WHERE token = $1 AND expires_at > $2',
      [token, new Date()]
    );

    if (rows.length === 0) {
      return res.status(400).render('reset-password', {
        error: 'Invalid or expired reset token.',
      });
    }

    const email = rows[0].email;

    // Validate the new password
    const { isValid, errors } = validatePassword(newPassword);

    if (!isValid) {
      return res.status(400).render('reset-password', {
        error: errors.join(' '), // Send back the validation errors
      });
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).render('reset-password', {
        error: 'Passwords do not match.',
      });
    }

    // Hash the new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the Users table
    await pool.query(
      'UPDATE "Users" SET password_hash = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    // Optionally, delete the reset token after successful reset to prevent reuse
    await pool.query('DELETE FROM "PasswordResetTokens" WHERE token = $1', [token]);

    res.render('login', { success: 'Your password has been successfully reset. You can now log in.' });
  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).render('reset-password', {
      error: 'There was an error processing your password reset. Please try again later.',
    });
  }
};

module.exports = { resetPassword };
