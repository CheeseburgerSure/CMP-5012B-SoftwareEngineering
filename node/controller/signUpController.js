const bcrypt = require('bcrypt');
const pool = require('../db');

// Handle sign-up form submission
const postRegister = async (req, res) => {
  const { firstName, lastName, countryCode, phoneNumber, email, confirmEmail, password, confirmPassword } = req.body;

  // Validation

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('create-account', { error: 'Invalid email format.' });
  }
  
  if (!firstName || !lastName || !countryCode || !phoneNumber || !email || !confirmEmail || !password || !confirmPassword) {
    return res.render('create-account', { error: 'All fields are required' });
  }

  if (email !== confirmEmail) {
    return res.render('create-account', { error: 'Emails do not match' });
  }

  if (password !== confirmPassword) {
    return res.render('create-account', { error: 'Passwords do not match' });
  }

  try {
    // Check if the email already exists
    const emailCheck = await pool.query('SELECT * FROM "Users" WHERE Email = $1', [email]);

    if (emailCheck.rows.length > 0) {
      return res.render('create-account', { error: 'Email is already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const newUser = await pool.query(
      'INSERT INTO "Users" (Email, First_Name, Last_Name, Country_Code, Phone_Number, Password_Hash, Verified) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [email, firstName, lastName, countryCode, phoneNumber, hashedPassword, false]  // Setting Verified to false initially
    );

    // After successful registration, redirect to login page or other page
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).render('create-account', { error: 'Server error, please try again' });
  }
};

module.exports = { postRegister };
