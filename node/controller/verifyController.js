const pool = require('../db');
const jwt = require('jsonwebtoken');

// Handle verification page GET
const getVerifyPage = (req, res) => {
  const { token } = req.query;  // Get the token from the query string

  if (!token) {
    return res.redirect('/login');
  }

  try {
    // Decode and verify the token
    const decoded = jwt.verify(token, 'your-secret-key'); // Verify the token with the same secret key
    
    // If verification fails or token is expired, redirect to login
    if (!decoded || !decoded.email) {
      return res.redirect('/login');
    }

    // Store email in session
    req.session.email = decoded.email;

    res.render('verify', { email: decoded.email, error: null });

  } catch (err) {
    console.error('Error verifying token:', err);
    return res.redirect('/login');  // Token invalid or expired
  }
};

// Handle verification form POST
const postVerify = async (req, res) => {
  const { code } = req.body;
  const email = req.session.email;

  // check if email variable is empty (null) if it is then redirect
  if (!email) {
    return res.redirect('/login');
  }

  try {
    const result = await pool.query(
      'SELECT verification_code, Code_Expires_At FROM "Users" WHERE Email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.render('verify', { email, error: 'No user found with that email.' });
    }

    const { verification_code, verification_expires } = result.rows[0];

    if (code !== verification_code) {
      return res.render('verify', { email, error: 'Invalid verification code.' });
    }

    const now = new Date();
    if (now > new Date(verification_expires)) {
      return res.render('verify', { email, error: 'Verification code has expired.' });
    }

    // Update user as verified
    await pool.query(
      'UPDATE "Users" SET Verified = true, verification_code = null, Code_Expires_At = null WHERE Email = $1',
      [email]
    );

    // Show success message to user
    res.render('verify', { email, success: true });

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).render('verify', { email, error: 'Server error. Please try again.' });
  }
};

module.exports = { getVerifyPage, postVerify };
