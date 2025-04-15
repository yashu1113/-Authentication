const transporter = require('./emailconfig'); // Import the transporter
require('dotenv').config();

const SendVerificationcode = async (email, verificationCode) => {
    try {
        const info = await transporter.sendMail({
            from: '"kodefactorconsulting 👻" <app.nodemailer2002@gmail.com>', // Sender address
            to: email, // Receiver's email address
            subject: 'Verify your email', // Subject line
            text: `Hello, please verify your email. Your code is ${verificationCode}`, // Plain text
            html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`, // HTML body
        });

        console.log('Message sent successfully:', info.messageId);
       
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { SendVerificationcode };
