import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
      lowercase: true,
      trim: true,
      required: true
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
    },
    address: {
      type: String,
    },
    favorites: {
      type: [String], // List of favorite things
      default: [],
    },
    lastLocation: {
      latitude: Number,
      longitude: Number,
      updatedAt: Date,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
