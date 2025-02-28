
const nodemailer = require('nodemailer');
require('dotenv').config();

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use secure connection
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

// Function to send email
async function sendEmail(options) {
    try {
        const info = await transporter.sendMail(options);
        console.log('Email sent: ' + info.response);
        return true; // Return true if email is sent successfully
    } catch (error) {
        console.error('Error sending email:', error);
        return false; // Return false if there's an error
    }
}

module.exports = { sendEmail };