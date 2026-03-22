const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  return transporter;
}

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransporter();

  if (!transport) {
    throw new Error("Email transport is not configured.");
  }

  await transport.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });
}

module.exports = {
  sendEmail
};
