import { SESClient, SendEmailCommand, GetAccountSendingEnabledCommand } from "@aws-sdk/client-ses";
import * as dotenv from "dotenv";
import { otpEmailTemplate } from "../template/otp.template.js";
dotenv.config();

// Initialize SES Client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Sender email (must be verified in SES)
const SENDER_EMAIL = process.env.EMAIL_USER;
const SENDER_NAME = "Your King's";

console.log("AWS SES Client initialized for region:", process.env.AWS_REGION || "ap-south-1");

// Helper function to send email via SES
const sendEmail = async ({ to, subject, htmlBody }) => {
  const params = {
    Source: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: "UTF-8",
      },
      Body: {
        Html: {
          Data: htmlBody,
          Charset: "UTF-8",
        },
      },
    },
  };

  const command = new SendEmailCommand(params);
  const response = await sesClient.send(command);
  console.log("Email sent successfully. MessageId:", response.MessageId);
  return response;
};

// Verify email connection for health check
export const verifyEmailConnection = async () => {
  try {
    const command = new GetAccountSendingEnabledCommand({});
    const response = await sesClient.send(command);
    console.log("SES Account Sending Enabled:", response.Enabled);
    return response.Enabled !== false; // true if sending is enabled
  } catch (error) {
    console.error("SES verification failed:", error.message);
    return false;
  }
};

export const sendOTPEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Your OTP Code",
    htmlBody: otpEmailTemplate(otp),
  });
};

export const sendTaskReminderEmail = async (email, taskTitle, taskTime) => {
  await sendEmail({
    to: email,
    subject: "Task Reminder: " + taskTitle,
    htmlBody: `
      <h1>Task Reminder</h1>
      <p>This is a reminder for your task: <strong>${taskTitle}</strong></p>
      <p>Due at: ${new Date(taskTime).toLocaleString()}</p>
      <p>Please complete it on time!</p>
    `,
  });
};

export const sendPartnerInviteEmail = async (email, inviterName, inviteeName) => {
  const { partnerInviteTemplate } = await import("../template/invite.template.js");

  await sendEmail({
    to: email,
    subject: `💕 ${inviterName} has added you to their heart!`,
    htmlBody: partnerInviteTemplate(inviterName, inviteeName),
  });
};

// Partner removed notification
export const sendPartnerRemovedEmail = async (email, partnerName, removedByName) => {
  await sendEmail({
    to: email,
    subject: `💔 ${removedByName} has ended your connection`,
    htmlBody: `
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
  });
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

  await sendEmail({
    to: email,
    subject: `${emoji} ${creatorName} added a new ${typeLabel}!`,
    htmlBody: `
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
  });
};

// Send Kiss Email
export const sendKissEmail = async (email, senderName) => {
  await sendEmail({
    to: email,
    subject: `💋 ${senderName} sent you a kiss!`,
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background: #FFF0F5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
          <tr>
            <td align="center">
              <div style="max-width: 500px; background: white; border-radius: 24px; padding: 40px; box-shadow: 0 8px 32px rgba(255, 105, 180, 0.2); text-align: center;">
                <div style="font-size: 80px; margin-bottom: 20px;">💋</div>
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
  });
};