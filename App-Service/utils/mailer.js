const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

async function sendProviderApprovedEmail(toEmail) {
  return transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: toEmail,
    subject: "Account Approval",
    text:
      "Hello,\n\nYour provider account has been approved. You can now log in and start receiving service requests.\n\nSmart Matching Team",
  });
}

module.exports = { sendProviderApprovedEmail };