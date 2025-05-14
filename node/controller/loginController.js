const bcrypt = require('bcrypt');
const pool = require('../db');

// Handle login form submission
const postLogin = async (req, res) => {
    const { email, password } = req.body;
    console.log('✅LOGIN ROUTER UTILISED✅');

    // Basic server-side validation
  if (!email || !password) {
    return res.render('login', { error: 'Both email and password are required.' });
  }

  try {
    // Query user by email
    const result = await pool.query('SELECT * FROM "users" WHERE "email" = $1', [email]);

    if (result.rows.length === 0) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    console.log('User retrieved from database:', user); // Log the full user object to see if Password_Hash exists
    console.log('Password received:', password); // Log the password input from the form
    console.log('Password Hash from database:', user.password_hash); // Log the password hash stored in the database

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.render('login', { error: 'Invalid email or password.' });
    }

    console.log('Verified status from DB:', user.verified);
    // Check if the user is verified
    if (user.verified !== true) {
      console.log('User not verified:', user); // Log to check the verified status
      return res.render('login', { error: 'Your account is not verified. Please check your email for the verification link.' });
    }
    // Store user session
    req.session.user = {
      id: user.user_id,
      email: user.email,
      name: user.name // Add other fields if needed
    };

    res.redirect('/dashboard');
  } catch (err) {
    console.error("Error during login process:",err);
    res.status(500).send('Server error');
  }
};

module.exports = { postLogin };