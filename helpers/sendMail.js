const nodemailer = require("nodemailer");
module.exports.sendMail = (email, subject, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Send an email using async/await
    (async () => {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            // text: "Hello world?", // Plain-text version of the message
            html: html
        });

        console.log("Message sent:", info.messageId);
    })();
}