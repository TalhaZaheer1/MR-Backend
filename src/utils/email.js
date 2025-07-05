const nodemailer = require('nodemailer');
require("dotenv").config();
  
console.log({email:process.env.EMAIL_USER,pass:process.env.EMAIL_PASS})
const sendEmail = async (to, subject, htmlContent) => {
  try {
    // Create a transporter using Gmail (you can use other email providers too)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Replace with your email
      to, // Recipient email
      subject, // Email subject
      html: htmlContent, // HTML content for the email body
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = {
  sendEmail
}
