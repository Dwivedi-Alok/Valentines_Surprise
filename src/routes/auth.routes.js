import express from "express";
import {
  sendSignupOtp,
  verifySignupOtp,
  verifyLoginOtp,
  sendLoginOtp,
  resendOtp,
  logoutUser,
} from "../services/auth.service.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { email } = req.body; // Extract only the email field
    const result = await sendSignupOtp(email); // Pass only the email to the service
    res.json(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
});


router.post("/verify-signup-otp", async (req, res) => {
  try {
    const { user, token } = await verifySignupOtp(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Signup successful",
      user,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/verify-login-otp", async (req, res) => {
  try {
    const { user, token } = await verifyLoginOtp(req.body);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // Required for SameSite=None
      sameSite: "none", // Required for cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = await sendLoginOtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const result = await resendOtp(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
});


router.get("/check-auth", protectRoute, (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/logout", protectRoute, async (req, res) => {
  try {
    const result = await logoutUser(res);
    res.json(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

export default router;
