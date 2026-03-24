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
<div style="margin:0; padding:0; background:#0b0f1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  
  <div style="max-width:520px; margin:40px auto; background:linear-gradient(145deg, #111827, #0f172a); border-radius:16px; padding:40px 30px; box-shadow:0 20px 60px rgba(0,0,0,0.6); border:1px solid rgba(255,255,255,0.05);">
    
    <!-- Brand -->
    <div style="text-align:center; margin-bottom:25px;">
      <h1 style="margin:0; font-size:22px; color:#818cf8;">✦ PathPilot</h1>
      <p style="color:#6b7280; font-size:13px;">AI-powered student growth platform</p>
    </div>

    <!-- Heading -->
    <h2 style="text-align:center; color:#e5e7eb;">Verify Your Email</h2>

    <p style="text-align:center; color:#9ca3af; font-size:14px; margin-bottom:30px;">
      Enter the verification code below to continue
    </p>

    <!-- OTP Box -->
    <div style="background:#111827; padding:25px; border-radius:12px; text-align:center; margin-bottom:25px;">
      <p style="color:#9ca3af; font-size:12px;">ONE-TIME PASSWORD</p>

      <div style="font-size:34px; letter-spacing:10px; font-weight:bold; color:#22c55e;">
        ${finalOtp}
      </div>
    </div>

    <!-- BUTTON -->
    <div style="text-align:center; margin:30px 0;">
      <a href="https://your-app-url.up.railway.app"
        style="
          display:inline-block;
          padding:12px 28px;
          font-size:14px;
          color:#ffffff;
          background:linear-gradient(135deg,#6366f1,#4f46e5);
          border-radius:8px;
          text-decoration:none;
          font-weight:600;
          box-shadow:0 4px 15px rgba(99,102,241,0.4);
        ">
        Open PathPilot →
      </a>
    </div>

    <!-- Info -->
    <p style="text-align:center; color:#9ca3af; font-size:13px;">
      This code will expire in <b>5 minutes</b>.<br/>
      Never share this code with anyone.
    </p>

    <div style="height:1px; background:rgba(255,255,255,0.06); margin:30px 0;"></div>

    <!-- Footer -->
    <p style="text-align:center; font-size:11px; color:#6b7280;">
      If you didn’t request this, you can safely ignore this email.<br/><br/>
      © ${new Date().getFullYear()} PathPilot
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
