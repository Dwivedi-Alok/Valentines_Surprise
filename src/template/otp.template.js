export const otpEmailTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #ffeef8 0%, #ffe0f0 100%); border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #d63384; margin-bottom: 5px;">💕 Email Verification 💕</h2>
        <p style="color: #c2185b; font-size: 16px; font-weight: 500;">Hey my Queen, here is your OTP 👑</p>
      </div>
      
      <div style="
        background: linear-gradient(135deg, #ff6b9d 0%, #c2185b 100%);
        font-size: 32px;
        font-weight: bold;
        color: #ffffff;
        margin: 20px auto;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        letter-spacing: 8px;
        box-shadow: 0 4px 15px rgba(214, 51, 132, 0.3);
        max-width: 280px;
      ">
        ${otp}
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        <p style="color: #d63384; font-weight: bold;">❤️ This OTP is valid for 5 minutes ❤️</p>
      </div>
      
      <div style="
        background: white;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #ff6b9d;
        margin-top: 20px;
      ">
        <p style="color: #888; margin: 0; font-size: 14px;">
          If you didn't request this, please ignore this email. 💌
        </p>
      </div>
      
      <div style="text-align: center; margin-top: 25px; font-size: 24px;">
        💖 ✨ 💝
      </div>
    </div>
  `;
};