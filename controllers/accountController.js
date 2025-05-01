const { sendEmail } = require('./email.js');
const pool = require('../db.js');
const bcrypt = require('bcrypt');

exports.createAccount = async function (req, res) {
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

  try {
    // Generate a unique verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const verificationLink = `http://localhost:3000/verify`;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const query = `
      INSERT INTO users (email, password, verified, verification_code)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [email, hashedPassword, false, verificationCode];

    await pool.query(query, values);

    // Send verification email
    await sendEmail(
      email,
      'Account Verification',
      `Your verification code is: ${verificationCode}. Visit this link to confirm: ${verificationLink}`
    );

    res.redirect('/verify');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating account.');
  }
};

exports.verifyAccount = async function (req, res) {
  const { email, verificationCode: enteredCode } = req.body;

  try {
    // Find the user by email and check verification code
    const query = `SELECT * FROM users WHERE email = $1;`;
    const { rows } = await pool.query(query, [email]);

    if (rows.length === 0) {
      return res.send('Account not found!');
    }

    const user = rows[0];

    if (parseInt(enteredCode) === user.verification_code) {
      // Update the user to mark as verified
      await pool.query(
        `UPDATE users SET verified = true WHERE email = $1;`,
        [email]
      );
      return res.send('Account verified successfully!');
    } else {
      return res.send('Invalid verification code!');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error verifying account.');
  }
};
