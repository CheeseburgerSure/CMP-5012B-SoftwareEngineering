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
async function sendVerificationEmail(to, code) {
  const subject = 'Verify your account';
  const text = `Your verification code is: ${code}`;
  await sendEmail(to, subject, text);
}

// Export the functions
module.exports = { sendEmail, sendVerificationEmail };
