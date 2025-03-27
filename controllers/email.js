import nodemailer from 'nodemailer';

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'parkflow113@gmail.com',
    pass: 'lsop thyf yfwk kkmr'
  }
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'parkflow113@gmail.com',
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

// Export the sendEmail function
export { sendEmail };
