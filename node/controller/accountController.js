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
  console.log('➡️ POST /register triggered');
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

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('create-account', { error: 'Invalid email format.' });
  }

  if (!firstName || !lastName || !countryCode || !phoneNumber || !email || !confirmEmail || !password || !confirmPassword || !tos) {
    return res.render('create-account', { error: 'All fields are required.' });
  }

  if (email !== confirmEmail) {
    return res.render('create-account', { error: 'Emails do not match.' });
  }

  if (password !== confirmPassword) {
    return res.render('create-account', { error: 'Passwords do not match.' });
  }

  const fullPhoneNumber = `${countryCode}${phoneNumber}`;

  try {
    // Check if email is already in use (case-insensitive)
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('An account with this email already exists');
      return res.render('create-account', { error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'INSERT INTO Users (First_Name, Last_Name, Country_Code, Phone_Number, Email, Password_Hash, Verification_Code, Code_Expires_At) VALUES ($1, $2, $3, $4, LOWER($5), $6, $7, $8)',
      [firstName, lastName, countryCode, fullPhoneNumber, email, hashedPassword, verificationCode, codeExpiresAt]
    );

    await sendVerificationEmail(email, verificationCode, firstName);

    res.render('create-account', {
      success: 'Account created successfully! Check your email for the verification code.'
    });

  } catch (err) {
    console.error(err);
    res.render('create-account', { error: 'Something went wrong. Please try again.' });
  }
};

// GET /verify
exports.getVerify = (req, res) => {
  const { email } = req.query;
  res.render('verify', { email });
};

// POST /verify
exports.verifyAccount = async (req, res) => {
  const { email, verificationCodeInput } = req.body;

  if (!email || !verificationCodeInput) {
    return res.render('verify', { error: 'Please provide both email and verification code.' });
  }

  try {
    const userResult = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.render('verify', { error: 'Invalid email or verification code.' });
    }

    const user = userResult.rows[0];

    if (user.verified) {
      return res.redirect('/login?info=already_verified');
    }

    if (new Date() > new Date(user.code_expires_at)) {
      return res.render('verify', { error: 'Verification code has expired.' });
    }

    if (user.verification_code !== verificationCodeInput) {
      return res.render('verify', { error: 'Incorrect verification code.' });
    }

    await pool.query(
      'UPDATE users SET verified = TRUE, verification_code = NULL WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    return res.redirect('/login?success=verified');

  } catch (err) {
    console.error(err);
    res.render('verify', { error: 'Something went wrong. Please try again.' });
  }
};
