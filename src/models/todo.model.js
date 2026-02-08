import mongoose from "mongoose";

const todoSchema = new mongoose.Schema(
    {
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
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        dateTime: {
            type: Date,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        reminderSent: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Todo = mongoose.model("Todo", todoSchema);

export default Todo;
