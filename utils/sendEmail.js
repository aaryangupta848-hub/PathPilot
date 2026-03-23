const nodemailer = require("nodemailer");

// 🔥 Hardcoded transporter (TEMP FIX)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aaryangupta848@gmail.com",
    pass: "pcyk mpuy dmof pqqz",
  },
});

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: "aaryangupta848@gmail.com",
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
}

module.exports = {
  sendEmail,
};
