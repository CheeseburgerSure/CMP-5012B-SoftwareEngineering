require('dotenv').config();

const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('./email');
const { validatePassword } = require('../utils/validators.js');

// Helper: Render error form
function renderWithError(res, error, data) {
  return res.render('create-account', {
    error,
    ...data
  });
}

const postRegister = async (req, res) => {
  let {
    firstName,
    lastName,
    countryCode,
    phoneNumber,
    email,
    confirmEmail,
    password,
    confirmPassword
  } = req.body;

  const errors = {};
  const formData = { firstName, lastName, countryCode, phoneNumber, email, confirmEmail, password, confirmPassword };

  // Normalize email
  email = email.toLowerCase();
  confirmEmail = confirmEmail.toLowerCase();

  // Basic validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.email = 'Invalid or missing email.';
  }

  if (!firstName || !lastName || !countryCode || !phoneNumber || !confirmEmail || !password || !confirmPassword) {
    errors.general = 'All fields are required.';
  }

  if (email !== confirmEmail) {
    errors.confirmEmail = 'Emails do not match.';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }

  // Optional: Validate phone number format (basic length check)
  if (!/^\d{7,15}$/.test(phoneNumber)) {
    errors.phoneNumber = 'Invalid phone number format.';
  }

  if (Object.keys(errors).length > 0) {
    return renderWithError(res, errors, formData);
  }

  try {
    // Check for existing user
    const emailCheck = await pool.query('SELECT * FROM "users" WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return renderWithError(res, { email: 'Email is already in use.' }, formData);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert user
    await pool.query(
      `INSERT INTO "users" 
       (email, first_name, last_name, country_code, phone_number, password_hash, verified, verification_code, code_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [email, firstName, lastName, countryCode, phoneNumber, hashedPassword, false, code, expiry]
    );

    // Send verification email
    await sendVerificationEmail(email, code, firstName);

    // Generate JWT
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '10m' });

    return res.redirect(`/verify?token=${token}`);
  } catch (err) {
    console.error('Registration error:', err);
    return renderWithError(res, { general: 'Server error, please try again.' }, formData);
  }
};

module.exports = { postRegister };
