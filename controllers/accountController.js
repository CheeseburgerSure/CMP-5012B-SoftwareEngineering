// controllers/accountController.js
import { sendEmail } from './email.js';  // Import the email sender
//import { users } from './database.js';  // You will need to store user data somewhere (like a database or in memory)

// Example user store
const users = [];

let verificationCode = ''; // Store the verification code for the session (or a database)

export async function createAccount(req, res) {
  const { email, confirmEmail, password, confirmPassword, tos } = req.body;

  // Validation
  if (email !== confirmEmail) {
    return res.send('Emails do not match!');
  }

  if (password !== confirmPassword) {
    return res.send('Passwords do not match!');
  }

  if (!tos) {
    return res.send('You must accept the terms and conditions!');
  }

  // Generate a unique verification code
  verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit number
  const verificationLink = `http://localhost:3000/verify`;

  // Send verification email
  await sendEmail(email, 'Account Verification', `Your verification code is: ${verificationCode}. Visit this link to confirm: ${verificationLink}`);

  // Store user data temporarily (You should save it to a real database)
  users.push({ email, password, verified: false });
  res.redirect('/verify');
}

// Handle verification
export function verifyAccount(req, res) {
  const { verificationCode: enteredCode } = req.body;

  // Check if entered code matches the generated code
  if (enteredCode == verificationCode) {
    // Mark the user as verified
    const user = users.find(u => u.email === req.body.email); // You'd get email from the session or request
    if (user) {
      user.verified = true;
      return res.send('Account verified successfully!');
    }
    return res.send('Account not found!');
  } else {
    return res.send('Invalid verification code!');
  }
}


// code for when the database is setup
// current problem with the account controller verifification:
// Storing the verificationCode in a plain global variable (let verificationCode = '').

// Variable is shared for everyone on the server.

// If two users request verification codes at the same time, they'll overwrite each other's codes.

// A smart attacker could try to brute-force the code quickly or confuse your server.

/*
import { pool } from '../db.cjs'; // This is your Postgres pool connection
import { sendEmail } from './email.js';
import bcrypt from 'bcrypt'; // For password hashing

export async function createAccount(req, res) {
  const { email, confirmEmail, password, confirmPassword, tos } = req.body;

  if (email !== confirmEmail) return res.send('Emails do not match!');
  if (password !== confirmPassword) return res.send('Passwords do not match!');
  if (!tos) return res.send('You must accept the terms!');

  const hashedPassword = await bcrypt.hash(password, 10); // Always store hashed passwords

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes later

  try {
    await pool.query(`
      INSERT INTO users (email, password_hash, verification_code, code_expires_at)
      VALUES ($1, $2, $3, $4)
    `, [email, hashedPassword, verificationCode, codeExpiresAt]);

    const verificationLink = `http://localhost:3000/verify`;

    await sendEmail(email, 'Account Verification', `Your code is: ${verificationCode}. Visit: ${verificationLink}`);

    res.redirect('/verify');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating account.');
  }
}

export async function verifyAccount(req, res) {
  const { email, verificationCode: enteredCode } = req.body;

  try {
    const { rows } = await pool.query(`
      SELECT * FROM users WHERE email = $1
    `, [email]);

    const user = rows[0];
    if (!user) return res.send('Account not found!');
    if (user.is_verified) return res.send('Account already verified!');
    if (Date.now() > new Date(user.code_expires_at)) {
      return res.send('Verification code expired!');
    }

    if (enteredCode === user.verification_code) {
      await pool.query(`
        UPDATE users SET is_verified = true WHERE email = $1
      `, [email]);
      return res.send('Account verified successfully!');
    } else {
      return res.send('Invalid verification code!');
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Error verifying account.');
  }
}

*/