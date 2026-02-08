import jwt from "jsonwebtoken"
import Otp from "../models/otp.model.js";
import User from "../models/user.model.js"
import Couple from "../models/couple.model.js";
import { generateOTP } from "../utils/otpGenerator.js";
import { sendOTPEmail } from "./mail.service.js";
import winston from "winston";
const { error } = winston;

export const sendSignupOtp = async (email) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new error("User already exists. please Login");
  }
  const otp = generateOTP();
  await Otp.deleteMany({ email, type: "signup" });
  await Otp.create({
    email,
    otp,
    type: "signup",
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });
  await sendOTPEmail(email, otp);
  return { message: "otp send for signup" };
};

export const verifySignupOtp = async ({ email, otp, first_name, last_name }) => {
  const otpDoc = await Otp.findOne({
    email,
    otp,
    type: "signup",
    used: false,
    expires_at: { $gt: new Date() },
  });

  if (!otpDoc) {
    throw new Error("Invalid or expired OTP");
  }

  otpDoc.used = true;
  await otpDoc.save();

  const user = await User.create({
    email,
    first_name,
    last_name,
  });

  // Check if this user was invited by someone - auto-link to couple
  const pendingCouple = await Couple.findOne({
    invite_email: email.toLowerCase(),
    status: "pending",
  });

  if (pendingCouple) {
    pendingCouple.user2 = user._id;
    pendingCouple.status = "accepted";
    pendingCouple.accepted_at = new Date();
    await pendingCouple.save();
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};

export const verifyLoginOtp = async ({ email, otp }) => {
  const otpDoc = await Otp.findOne({
    email,
    otp,
    type: "login",
    used: false,
    expires_at: { $gt: new Date() },
  });

  if (!otpDoc) {
    throw new Error("Invalid or expired OTP");
  }

  otpDoc.used = true;
  await otpDoc.save();

  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const token = jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { user, token };
};
export const sendLoginOtp = async ({ email }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found. Please signup first.");
  }

  const otp = generateOTP();


  await Otp.deleteMany({ email, type: "login" });

  await Otp.create({
    email,
    otp,
    type: "login",
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendOTPEmail(email, otp);

  return { message: "Login OTP sent" };
};


export const resendOtp = async ({ email, type }) => {
  if (!email || !type) {
    throw new Error("Email and type required");
  }

  // For login, check user exists
  if (type === "login") {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
  }

  const otp = generateOTP();


  await Otp.deleteMany({ email, type });

  await Otp.create({
    email,
    otp,
    type,
    expires_at: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendOTPEmail(email, otp);

  return { message: "OTP resent successfully" };
};


export const logoutUser = async (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  return { message: "Logged out successfully" };
};