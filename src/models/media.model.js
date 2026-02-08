import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
    {
        couple: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Couple",
            required: true,
        },
        uploaded_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["video", "audio", "image"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        s3_key: {
            type: String,
            required: true,
        },
        content_type: {
            type: String,
        },
        size_bytes: {
            type: Number,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
