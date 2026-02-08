import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        couple: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Couple",
        },
        type: {
            type: String,
            enum: ["link", "qr_image"],
            required: true,
        },
        title: {
            type: String, // e.g., "GPay", "Bank Details"
            required: true,
        },
        value: {
            type: String, // URL or S3 Key
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
