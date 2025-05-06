const bcrypt = require('bcryptjs');
const pool = require('../db');  // db.js
const { sendVerificationEmail } = require('./email.js');  // email.js

// Generate 6-digit code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GET /register
exports.getRegister = (req, res) => {
  res.render('create-account');  // matches your Pug filename!
};

// POST /register
exports.postRegister = async (req, res) => {

  // DEBUG
  console.log('➡️ POST /createAccountForm triggered');
  console.log('Request body:', req.body);

  const {
    firstName,
    lastName,
    countryCode,
    phoneNumber,
    email,
    confirmEmail,
    password,
    confirmPassword,
    tos
  } = req.body;

  // Server-side validation
  // if (!firstName || !lastName || !countryCode || !phoneNumber || !email || !confirmEmail || !password || !confirmPassword || !tos) {
  //   // res.render('create-account', { error: 'All fields are required.' });
  //   console.log("Fields");
  // }

  if (!firstName) {
    console.log("First name is required.");
  }
  
  if (!lastName) {
    console.log("Last name is required.");
  }
  
  if (!countryCode) {
    console.log("Country code is required.");
  }
  
  if (!phoneNumber) {
    console.log("Phone number is required.");
  }
  
  if (!email) {
    console.log("Email is required.");
  }
  
  if (!confirmEmail) {
    console.log("Confirm email is required.");
  }
  
  if (!password) {
    console.log("Password is required.");
  }
  
  if (!confirmPassword) {
    console.log("Confirm password is required.");
  }
  
  if (!tos) {
    console.log("Terms of service must be accepted.");
  }
  
  if (email !== confirmEmail) {
    // res.render('create-account', { error: 'Emails do not match.' });
    console.log("emails");
  }

  if (password !== confirmPassword) {
    // res.render('create-account', { error: 'Passwords do not match.' });
    console.log("Passwords");
  }

  // Optional: Validate phone number format
  const fullPhoneNumber = `${countryCode}${phoneNumber}`;


  // ANTI SQL INJECTION VALIDATION
  
  try {
    // Check if email is already in use
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.render('create-account', { error: 'An account with this email already exists.' });
    }
    console.log('New email account being used to create account')

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
``
    // Insert new user
    await pool.query(
      'INSERT INTO users (first_name, last_name, country_code, phone_number, email, password_hash, verification_code) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [firstName, lastName, countryCode, fullPhoneNumber, email, hashedPassword, verificationCode]
    );

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.render('create-account', { success: 'Account created successfully! Check your email for the verification code.' });
  } catch (err) {
    console.error(err);
    res.render('create-account', { error: 'Something went wrong. Please try again.' });
  }
};

// POST /verify
exports.verifyAccount = async (req, res) => {
  const { email, verificationCode } = req.body;

  if (!email || !verificationCode) {
    return res.render('verify', { error: 'Please provide both email and verification code.' });
  }

  try {
    // Check if user exists with matching verification code
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND verification_code = $2',
      [email, verificationCode]
    );

    if (userResult.rows.length === 0) {
      return res.render('verify', { error: 'Invalid email or verification code.' });
    }

    // Mark the user as verified
    await pool.query(
      'UPDATE users SET verified = TRUE, verification_code = NULL WHERE email = $1',
      [email]
    );

    res.render('verify', { success: '✅ Your account has been verified successfully!' });
  } catch (err) {
    console.error(err);
    res.render('verify', { error: 'Something went wrong. Please try again.' });
  }
};
