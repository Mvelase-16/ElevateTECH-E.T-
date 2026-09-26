const nodemailer = require('nodemailer');

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Configure transporter if SMTP variables are supplied in .env
let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Sends a password reset email or outputs clean development preview
 */
async function sendPasswordResetEmail({ toEmail, recipientName = 'Student', resetToken }) {
  const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;

  const htmlContent = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E5E7EB;">
      <div style="background-color: #7A0C2E; padding: 28px 24px; text-align: center; color: #FFFFFF;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800;">Uni<span style="color: #FCD34D;">BITES</span></h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">Walter Sisulu University Cafeteria</p>
      </div>
      <div style="padding: 28px 24px;">
        <h2 style="font-size: 18px; color: #111827; margin-bottom: 12px;">Password Reset Request</h2>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">Hello ${recipientName},</p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          We received a request to reset the password for your UniBITES account (<strong>${toEmail}</strong>).
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetLink}" 
             style="background-color: #7A0C2E; color: #FFFFFF; padding: 14px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; display: inline-block;">
            Reset Your Password
          </a>
        </div>
        <p style="font-size: 12px; color: #6B7280; line-height: 1.5;">
          If the button above does not work, copy and paste this link into your web browser:<br>
          <a href="${resetLink}" style="color: #7A0C2E; word-break: break-all;">${resetLink}</a>
        </p>
        <p style="font-size: 12px; color: #9CA3AF; margin-top: 24px; border-top: 1px solid #F3F4F6; padding-top: 16px;">
          ⏱️ This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.
        </p>
      </div>
    </div>
  `;

  // 1. If SMTP is configured, send the real email
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"UniBITES Campus Cafeteria" <no-reply@unibites.wsu.ac.za>',
        to: toEmail,
        subject: 'Reset your UniBITES password',
        html: htmlContent,
        text: `Hello ${recipientName},\n\nReset your UniBITES password by clicking: ${resetLink}\n\nThis link expires in 1 hour.`
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error('SMTP sending error:', err);
    }
  }

  // 2. Development Mode / Fallback logger
  console.log('\n===================================================================');
  console.log('🔑 [UNIBITES DEV EMAIL SERVICE - PASSWORD RESET LINK]');
  console.log(`📧 Recipient: ${toEmail} (${recipientName})`);
  console.log(`🔗 Reset Link: ${resetLink}`);
  console.log('⏱️  Validity: 1 Hour (Single Use)');
  console.log('===================================================================\n');

  return {
    success: true,
    devMode: true,
    resetLink
  };
}

module.exports = {
  sendPasswordResetEmail
};
