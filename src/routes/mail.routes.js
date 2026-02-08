import express from "express";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendOTPEmail } from "../services/mail.service.js";

const router = express.Router();

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send("Email is required");
    }

    const otp = generateOTP();

    await sendOTPEmail(email, otp);

    res.json({
      message: "OTP sent successfully",
      otp, //remove in production
    });

  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
