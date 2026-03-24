const nodemailer = require("nodemailer");

let transporter = null;

// 🔥 Create transporter (Brevo SMTP)
function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, // Brevo login
      pass: process.env.EMAIL_PASS, // Brevo SMTP key
    },
  });

  console.log("✅ Brevo transporter ready");
  return transporter;
}

// 🚀 Send email function (with modern UI)
async function sendEmail({ to, subject, otp }) {
  try {
    const transport = getTransporter();

    const html = `
    <div style="font-family: Arial, sans-serif; background:#0f172a; padding:40px; color:#fff;">
      
      <div style="max-width:500px; margin:auto; background:#111827; border-radius:12px; padding:30px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.4);">
        
        <h2 style="color:#6366f1; margin-bottom:10px;">🚀 PathPilot</h2>
        
        <p style="color:#9ca3af; margin-bottom:20px;">
          Verify your email to continue your journey
        </p>

        <div style="background:#1f2937; padding:20px; border-radius:10px; margin:20px 0;">
          <p style="margin:0; color:#9ca3af;">Your OTP Code</p>
          
          <h1 style="letter-spacing:6px; font-size:32px; color:#22c55e; margin:10px 0;">
            ${otp}
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

    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM, // your verified email
      to,
      subject,
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
