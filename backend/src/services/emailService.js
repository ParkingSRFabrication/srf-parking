import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter = null;

/**
 * Initialize and get Nodemailer transporter
 */
export async function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const emailService = process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE;

  if (smtpUser && smtpPass) {
    if (emailService === 'gmail' || smtpHost.includes('gmail.com')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      console.log(`[Nodemailer] Configured with Gmail service for: ${smtpUser}`);
    } else {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
      console.log(`[Nodemailer] Configured with custom SMTP host: ${smtpHost}:${smtpPort}`);
    }
  }

  return transporter;
}

/**
 * Send OTP Verification Email via Nodemailer
 */
export async function sendOtpEmail(toEmail, otpCode) {
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const hasLiveCredentials = Boolean(smtpUser && smtpPass);

  if (!hasLiveCredentials) {
    console.log(`\n======================================================`);
    console.log(`[OTP NOTICE] SMTP credentials not set in backend/.env`);
    console.log(`[OTP TARGET] Email: ${toEmail}`);
    console.log(`[OTP CODE] Verification Code: ${otpCode}`);
    console.log(`[OTP MASTER] Testing Master Code: 123456`);
    console.log(`======================================================\n`);
    return {
      success: false,
      isLiveSmtp: false,
      simulated: true,
      code: otpCode,
      message: 'SMTP credentials not configured in backend/.env. Using simulated OTP mode.'
    };
  }

  try {
    const transport = await getTransporter();
    if (!transport) {
      throw new Error('Email transporter could not be initialized.');
    }
    const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || '"SRF Parking Management" <noreply@srfparking.com>';

    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      subject: `Your SRF Parking Login Code: ${otpCode}`,
      text: `Hello,\n\nYour SRF Parking verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\nSR Fabrication - Railway Station Vehicle Parking Management System`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
            .container { max-width: 480px; margin: 0 auto; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 32px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4); }
            .header { text-align: center; margin-bottom: 24px; }
            .title { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
            .subtitle { font-size: 12px; color: #94a3b8; margin: 4px 0 0 0; }
            .code-box { background: #0f172a; border: 2px dashed #6366f1; border-radius: 14px; text-align: center; padding: 20px; margin: 24px 0; }
            .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; font-family: monospace; }
            .instructions { font-size: 13px; color: #cbd5e1; line-height: 1.6; text-align: center; margin: 0; }
            .footer { text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">SR FABRICATION</h1>
              <p class="subtitle">Railway Station Vehicle Parking System</p>
            </div>
            <p class="instructions">Use the verification code below to complete sign-in for your account (<strong>${toEmail}</strong>):</p>
            <div class="code-box">
              <div class="otp-code">${otpCode}</div>
            </div>
            <p class="instructions">This verification code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <div class="footer">
              Authorized Railway Parking Plaza • SR Fabrication<br>
              This is an automated system email. Please do not reply.
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`[Nodemailer] Verification email sent to ${toEmail}. MessageId: ${info.messageId}`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Nodemailer] Preview URL: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null
    };
  } catch (error) {
    console.error(`[Nodemailer] Failed to send email to ${toEmail}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
