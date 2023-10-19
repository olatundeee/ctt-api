const nodemailer = require('nodemailer');

async function sendEmail(toEmail, subject, htmlBody) {
  // Create a nodemailer transporter using your email service provider
  const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'admin@cttpodcast.com',
      pass: 'cTeeTeePurd12#',
    },
  });

  // Setup email options
  const mailOptions = {
    from: 'admin@cttpodcast.com',
    to: toEmail,
    subject: subject,
    html: htmlBody,
  };

  // Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

module.exports = sendEmail;
