// import { createTransport } from "nodemailer";

// const sendConfirmationEmail = async (to, subject, text) => {
//     const transporter = createTransport({
//         service: "gmail",
//         auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//         },
//     });

//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         text,
//     };

//     await transporter.sendMail(mailOptions);
// };

// export default { sendConfirmationEmail };

// utils/mailer.js

// import { createTransport } from "nodemailer";

// const transporter = createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export const sendConfirmationEmail = async (to, subject, text) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         text,
//     };

//     await transporter.sendMail(mailOptions);
// };

// // utils/mailer.js
// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });

// export const sendConfirmationEmail = async (to, subject, text) => {
//     const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to,
//         subject,
//         text,
//     };

//     await transporter.sendMail(mailOptions);
// };

const nodemailer = require("nodemailer");

const sendConfirmationEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendConfirmationEmail };
