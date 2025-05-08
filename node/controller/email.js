const nodemailer = require('nodemailer');

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
// Should also send verification page /verify.pug
async function sendVerificationEmail(to, code, firstName) {
  const subject = 'Verify Your ParkFlow Account';
  const verificationLink = `http://localhost:3000/verify?email=${encodeURIComponent(to)}&code=${code}`;

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

// Export the functions
module.exports = { sendEmail, sendVerificationEmail };
