const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const emailApi = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendEmail({ to, subject, text, html, otp }) {
  try {
    // 🔥 FIX: extract OTP if not passed
    let finalOtp = otp;

    if (!finalOtp && text) {
      const match = text.match(/\d{4,6}/);
      finalOtp = match ? match[0] : "------";
    }

    // 🎨 MODERN EMAIL DESIGN
    const htmlContent = `
    <div style="font-family: Arial, sans-serif; background:#0f172a; padding:40px; color:#fff;">
      
      <div style="max-width:500px; margin:auto; background:#111827; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
        
        <h2 style="color:#6366f1; margin-bottom:10px;">🚀 PathPilot</h2>
        
        <p style="color:#9ca3af; margin-bottom:20px;">
          Verify your email to continue your journey
        </p>

        <div style="background:#1f2937; padding:20px; border-radius:10px; margin:20px 0;">
          <p style="margin:0; color:#9ca3af;">Your OTP Code</p>
          
          <h1 style="letter-spacing:6px; font-size:32px; color:#22c55e; margin:10px 0;">
            ${finalOtp}
          </h1>
        </div>

        <p style="color:#9ca3af; font-size:14px;">
          This code is valid for 5 minutes.<br/>
          Do not share it with anyone.
        </p>

        <hr style="border:none; border-top:1px solid #374151; margin:25px 0;" />

        <p style="font-size:12px; color:#6b7280;">
          If you didn’t request this, you can safely ignore this email.
        </p>

      </div>
    </div>
    `;

    await emailApi.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: "PathPilot",
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    });

    console.log("✅ Email sent");

  } catch (err) {
    console.error("❌ Email error:", err.response?.body || err);
    throw err;
  }
}

module.exports = { sendEmail };
