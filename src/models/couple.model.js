import mongoose from "mongoose";

const coupleSchema = new mongoose.Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        invite_email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        invite_first_name: {
            type: String,
        },
        invite_last_name: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "accepted"],
            default: "pending",
        },
        invited_at: {
            type: Date,
            default: Date.now,
        },
        accepted_at: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Helper: find couple for a user (either as user1 or user2)
coupleSchema.statics.findByUser = function (userId) {
    return this.findOne({
        $or: [{ user1: userId }, { user2: userId }],
    }).populate("user1 user2");
};

export default mongoose.model("Couple", coupleSchema);
