import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    expires_at: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);


otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Otp", otpSchema);
