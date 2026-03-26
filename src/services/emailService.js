const nodemailer = require('nodemailer');
const { wrapEmail } = require("./emailTemplates");
const config = require("../config/index");


const transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: false,
    auth: {
        user: config.email.smtpUser,
        pass: config.email.smtpPass,
    }
});

const sendEmail = async ({ to, subject, html, preheader }) => {
    await transporter.sendMail({
        from: `DevSync <${config.email.fromEmail}>`,
        to,
        subject,
        html: wrapEmail({ subject, preheader, contentHtml: html })
    });
};
module.exports = sendEmail;