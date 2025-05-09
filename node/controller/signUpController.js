const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./email');


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

  if (16 > password.length < 8) {
    return res.render('create-account', { error: 'Password must be at least 8 characters long and maximum 16 characters' });
  }

  const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (!passwordStrengthRegex.test(password)) {
    return res.render('create-account', { error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.' });
  }

  try {
    // Check if the email already exists
    const emailCheck = await pool.query('SELECT * FROM "Users" WHERE Email = $1', [email]);

    if (emailCheck.rows.length > 0) {
      return res.render('create-account', { error: 'Email is already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Insert the user into the database
    const newUser = await pool.query(
      `INSERT INTO "Users" (Email, First_Name, Last_Name, Country_Code, Phone_Number, Password_Hash, Verified, Verification_Code, Code_Expires_At)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [email, firstName, lastName, countryCode, phoneNumber, hashedPassword, false, code, expiry]
    );


    // Send the verification email
    await sendVerificationEmail(email, code, firstName);

    const token = jwt.sign({ email }, 'your-secret-key', { expiresIn: '10m' });

    console.log('Token:', token);  // Debugging line

    // Redirect to a page telling them to check their email
    res.redirect(`/verify?token=${token}`);
  } catch (err) {
    console.error(err);
    res.status(500).render('create-account', { error: 'Server error, please try again' });
  }
};

module.exports = { postRegister };
