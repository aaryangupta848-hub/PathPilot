const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendEmail({ to, subject, otp }) {
  try {
    const htmlContent = `
    <div style="font-family: Arial; background:#0f172a; padding:40px; color:#fff;">
      <div style="max-width:500px; margin:auto; background:#111827; padding:30px; border-radius:12px; text-align:center;">
        
        <h2 style="color:#6366f1;">🚀 PathPilot</h2>
        <p style="color:#9ca3af;">Verify your email</p>

        <div style="background:#1f2937; padding:20px; border-radius:10px;">
          <p>Your OTP Code</p>
          <h1 style="letter-spacing:6px; color:#22c55e;">${otp}</h1>
        </div>

        <p style="font-size:14px;">Valid for 5 minutes</p>
      </div>
    </div>
    `;

    const result = await emailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: "PathPilot",
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: htmlContent,
    });

    console.log("✅ Email sent:", result);

  } catch (err) {
    console.error("❌ Email error:", err.response?.body || err);
    throw err;
  }
}

module.exports = { sendEmail };
