const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465, false for 587
    auth: {
        user: 'yashchoudhari4301@gmail.com',
        pass: 'txlg zssy rfwc nqlk', // this should be an app password, not your login password
    },
});

// Optional test function — comment out if not needed
// const sendEmail = async (email, subject, text) => {
//     try {
//         const info = await transporter.sendMail({
//             from: '"kodefactorconsulting 👻" <app.nodemailer2002@gmail.com>',
//             to: email,
//             subject: subject,
//             text: text,
//             html: `<b>${text}</b>`,
//         });
//         console.log('Message sent: %s', info.messageId);
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// };

// sendEmail('yashchoudhari4301@gmail.com', 'Test', 'This is a test email');

module.exports = transporter;
