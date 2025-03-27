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
  const verificationLink = `http://localhost:3000/verification`;

  // Send verification email
  await sendEmail(email, 'Account Verification', `Your verification code is: ${verificationCode}. Visit this link to confirm: ${verificationLink}`);

  // Store user data temporarily (You should save it to a real database)
  users.push({ email, password, verified: false });
  res.redirect('/verification');
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
