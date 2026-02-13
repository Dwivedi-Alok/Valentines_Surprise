export const partnerInviteTemplate = (inviterName, inviteeName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've Been Added to Someone's Heart 💕</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background: linear-gradient(135deg, #FFF8F6 0%, #FFEAE6 100%);">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 500px; background: white; border-radius: 24px; box-shadow: 0 8px 32px rgba(180, 120, 120, 0.15); overflow: hidden;">
          
          <!-- Header with Hearts -->
          <tr>
            <td style="background: linear-gradient(135deg, #B76E79 0%, #A85A67 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 48px; margin-bottom: 16px;">💕</div>
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: normal; letter-spacing: 0.5px;">
                Congratulations, ${inviteeName}!
              </h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <p style="font-size: 20px; color: #8B4A5A; margin: 0 0 24px 0; line-height: 1.6;">
                <strong>${inviterName}</strong> has added you to their heart ❤️
              </p>
              
              <p style="font-size: 16px; color: #7A6A6F; margin: 0 0 32px 0; line-height: 1.7;">
                They've created a special space just for both of you — 
                to share memories, plan moments together, and celebrate your love.
              </p>

              <div style="background: #FFF8F6; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <p style="font-size: 18px; color: #B76E79; margin: 0; font-style: italic;">
                  "Every love story is beautiful, but ours is my favorite."
                </p>
              </div>

              <a href="${(process.env.FRONTEND_URL || 'https://valentines-surprise-frontend.vercel.app').replace(/\/$/, '')}/signup" 
                 style="display: inline-block; background: linear-gradient(135deg, #B76E79 0%, #A85A67 100%); 
                        color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px;
                        font-size: 16px; font-weight: 500; letter-spacing: 0.5px;
                        box-shadow: 0 4px 16px rgba(183, 110, 121, 0.3);">
                Accept & Join 💝
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 30px; background: #FFF8F6; text-align: center; border-top: 1px solid #F5D0CC;">
              <p style="font-size: 13px; color: #A89A9F; margin: 0;">
                Made with love for you two 💕
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
