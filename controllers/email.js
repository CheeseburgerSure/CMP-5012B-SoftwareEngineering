const nodemailer = require("nodemailer")

// Create a transporter object
// We use GMAIL
const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'parkflow@gmail.com',
    pass: '--- ' // enter the password
  }
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'parkflow@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = { sendEmail };
