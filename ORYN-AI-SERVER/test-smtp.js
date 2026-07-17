const nodemailer = require('nodemailer');
require('dotenv').config();

async function main() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Oryn AI" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Test Email",
      text: "This is a test.",
    });

    console.log("Success:", info.messageId);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
main();
