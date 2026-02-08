import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    couple: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Couple",
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    clicks: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

const Url = mongoose.model("Url", urlSchema);

export default Url;