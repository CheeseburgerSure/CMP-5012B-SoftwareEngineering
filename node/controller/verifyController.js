const pool = require('../db');

// Handle verification page GET
const getVerifyPage = (req, res) => {
  const { email } = req.query;
  if (!email) return res.redirect('/login');
  res.render('verify', { email, error: null });
};

// Handle verification form POST
const postVerify = async (req, res) => {
  const { email, code } = req.body;

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

    res.redirect('/login');
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).render('verify', { email, error: 'Server error. Please try again.' });
  }
};

module.exports = { getVerifyPage, postVerify };
