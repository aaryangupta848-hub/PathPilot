const { Resend } = require("resend");

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev", // ✅ works instantly (no setup needed)
      to,
      subject,
      text,
      html,
    });

    console.log("✅ Email sent:", response);
  } catch (err) {
    console.error("❌ Email error:", err);
    throw err;
  }
}

module.exports = {
  sendEmail,
};
