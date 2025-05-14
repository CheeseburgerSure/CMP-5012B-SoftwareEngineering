const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'parkflow113@gmail.com',
    pass: 'lsop thyf yfwk kkmr'
  }
});

// General email sending function
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'parkflow113@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// Verification email helper
async function sendVerificationEmail(to, code, firstName) {
  const subject = 'Verify Your ParkFlow Account';

  // Generate a token with the email, verification code, and expiry
  const token = jwt.sign(
    { email: to, code: code },  // Data to encode in the token
    'your-secret-key',          // Secret key to sign the token
    { expiresIn: '10m' }        // Expiry time of 10 minutes
  );

  const verificationLink = `http://localhost:3000/verify?token=${token}`;

  const text = `
  Hi ${firstName},

  Thank you for creating an account with ParkFlow!

  To verify your email address and activate your account, please use the following 6-digit verification code:

  🔐 Your code: ${code}

  Alternatively, you can click the link below to verify your email:

  ➡️ [Verify your account]( ${verificationLink} )

  This code will expire in 10 minutes. Please do not share this code with anyone.

  If you did not sign up for ParkFlow, please ignore this message.

  Best regards,  
  - The ParkFlow Team
  `;
  await sendEmail(to, subject, text);
}

async function sendForgotPassword(to, resetLink, firstName) {
  const subject = 'Reset Your ParkFlow Password';

  const text = `
Hi ${firstName},

We received a request to reset your password for your ParkFlow account.

You can reset your password securely using the link below:

➡️ Reset your password: ${resetLink}

This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact support.

Best regards,  
– The ParkFlow Team
  `;

  await sendEmail(to, subject, text);
}

// Export the functions
module.exports = { sendEmail, sendVerificationEmail, sendForgotPassword};
