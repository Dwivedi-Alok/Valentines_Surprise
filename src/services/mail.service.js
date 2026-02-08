import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import dns from "node:dns";
import { otpEmailTemplate } from "../template/otp.template.js";
dotenv.config();

// Custom DNS lookup that forces IPv4
const customDnsLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { family: 4 }, (err, address, family) => {
    callback(err, address, family);
  });
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // Force IPv4
  dnsLookup: customDnsLookup, // Custom lookup to ensure IPv4
  /* 
   * connectionTimeout: 10000, // 10 seconds
   * greetingTimeout: 10000, 
   * socketTimeout: 10000, 
   */
});

console.log("Nodemailer transporter created with custom IPv4 DNS lookup");

// Verify email connection for health check
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("SMTP verification failed:", error.message);
    return false;
  }
};

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Your King's " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: otpEmailTemplate(otp),
  };

  await transporter.sendMail(mailOptions);
};

export const sendTaskReminderEmail = async (email, taskTitle, taskTime) => {
  const mailOptions = {
    from: `"Your King's " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Task Reminder: " + taskTitle,
    html: `
      <h1>Task Reminder</h1>
      <p>This is a reminder for your task: <strong>${taskTitle}</strong></p>
      <p>Due at: ${new Date(taskTime).toLocaleString()}</p>
      <p>Please complete it on time!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPartnerInviteEmail = async (email, inviterName, inviteeName) => {
  const { partnerInviteTemplate } = await import("../template/invite.template.js");

  const mailOptions = {
    from: `"Your King's " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `💕 ${inviterName} has added you to their heart!`,
    html: partnerInviteTemplate(inviterName, inviteeName),
  };

  await transporter.sendMail(mailOptions);
};

// Partner removed notification
export const sendPartnerRemovedEmail = async (email, partnerName, removedByName) => {
  const mailOptions = {
    from: `"Your King's " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `💔 ${removedByName} has ended your connection`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 40px 20px; font-family: 'Georgia', serif; background: #FFF8F6;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 8px 32px rgba(180, 120, 120, 0.15);">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 48px;">💔</span>
          </div>
          <h1 style="color: #8B4A5A; text-align: center; margin: 0 0 24px 0;">Goodbye for now, ${partnerName}</h1>
          <p style="color: #7A6A6F; text-align: center; line-height: 1.7;">
            <strong>${removedByName}</strong> has removed you as their partner. 
            Your shared memories will no longer be accessible together.
          </p>
          <p style="color: #A89A9F; text-align: center; font-size: 14px; margin-top: 32px;">
            Sometimes hearts need different paths. 💕
          </p>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// New content notification to partner
export const sendNewContentEmail = async (email, partnerName, creatorName, contentType, contentTitle) => {
  const emojis = {
    task: '📝',
    url: '🔗',
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    media: '📱',
  };

  const emoji = emojis[contentType] || '✨';
  const typeLabel = contentType === 'url' ? 'link' : contentType;

  const mailOptions = {
    from: `"Your King's " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${emoji} ${creatorName} added a new ${typeLabel}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 40px 20px; font-family: 'Georgia', serif; background: linear-gradient(135deg, #FFF8F6 0%, #FFEAE6 100%);">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(180, 120, 120, 0.15);">
          <div style="background: linear-gradient(135deg, #B76E79 0%, #A85A67 100%); padding: 30px; text-align: center;">
            <span style="font-size: 48px;">${emoji}</span>
            <h1 style="color: white; margin: 16px 0 0 0; font-size: 20px;">New ${typeLabel} added!</h1>
          </div>
          <div style="padding: 32px; text-align: center;">
            <p style="color: #8B4A5A; font-size: 18px; margin: 0 0 16px 0;">
              Hey ${partnerName}! 💕
            </p>
            <p style="color: #7A6A6F; line-height: 1.7; margin: 0 0 24px 0;">
              <strong>${creatorName}</strong> just added a new ${typeLabel}:
            </p>
            <div style="background: #FFF8F6; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <p style="color: #B76E79; font-size: 16px; margin: 0; font-weight: 500;">
                "${contentTitle}"
              </p>
            </div>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}" 
               style="display: inline-block; background: linear-gradient(135deg, #B76E79 0%, #A85A67 100%); 
                      color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px;
                      font-size: 14px;">
              Check it out 💝
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send Kiss Email
export const sendKissEmail = async (email, senderName) => {
  const mailOptions = {
    from: `"Your King's " <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `💋 ${senderName} sent you a kiss!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background: #FFF0F5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <div style="max-width: 500px; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 8px 32px rgba(255, 105, 180, 0.2); text-align: center;">
                <div style="font-size: 80px; margin-bottom: 20px; animation: heartbeat 1.5s infinite;">💋</div>
                <h1 style="color: #D63384; margin: 0 0 16px 0; font-size: 28px;">Muah!</h1>
                <p style="color: #8B4A5A; font-size: 20px; line-height: 1.6; margin: 0;">
                  <strong>${senderName}</strong> is thinking of you and sending lots of love!
                </p>
                <div style="margin-top: 32px; font-size: 40px;">❤️❤️❤️</div>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};