import Todo from "../models/todo.model.js";
import Couple from "../models/couple.model.js";
import User from "../models/user.model.js";
import { sendTaskReminderEmail, sendNewContentEmail } from "./mail.service.js";

export const createTodo = async ({ title, description, dateTime, userId }) => {
    if (!title || !dateTime) {
        throw new Error("Title and dateTime are required");
    }

    // Find user's couple (optional)
    const couple = await Couple.findByUser(userId);

    const todo = await Todo.create({
        title,
        description,
        dateTime: new Date(dateTime),
        couple: couple?._id || null,
        user: userId,
        created_by: userId,
    });

    // Notify partner about new task
    if (couple && couple.status === "accepted") {
        const creator = await User.findById(userId);
        const creatorName = `${creator.first_name} ${creator.last_name || ""}`.trim();

        // Find partner
        const partnerId = couple.user1._id.toString() === userId.toString()
            ? couple.user2?._id
            : couple.user1?._id;

        if (partnerId) {
            const partner = await User.findById(partnerId);
            if (partner && partner.email) {
                const partnerName = `${partner.first_name} ${partner.last_name || ""}`.trim();
                await sendNewContentEmail(partner.email, partnerName, creatorName, "task", title);
            }
        }
    }

    return todo;
};

export const getTodos = async (userId) => {
    // Find user's couple
    const couple = await Couple.findByUser(userId);

    // If user has a couple, get all todos for that couple
    // Otherwise, get only user's personal todos
    const query = couple
        ? { couple: couple._id }
        : { user: userId };

    return await Todo.find(query)
        .populate("created_by", "first_name last_name")
        .sort({ dateTime: 1 });
};

export const updateTodo = async (id, userId, updates) => {
    // Find user's couple
    const couple = await Couple.findByUser(userId);

    // Build query - can update if belongs to couple or user
    const query = couple
        ? { _id: id, couple: couple._id }
        : { _id: id, user: userId };

    const todo = await Todo.findOneAndUpdate(
        query,
        updates,
        { new: true }
    );

    if (!todo) {
        throw new Error("Todo not found");
    }

    return todo;
};

export const deleteTodo = async (id, userId) => {
    // Find user's couple
    const couple = await Couple.findByUser(userId);

    // Build query - can delete if belongs to couple or user
    const query = couple
        ? { _id: id, couple: couple._id }
        : { _id: id, user: userId };

    const todo = await Todo.findOneAndDelete(query);

    if (!todo) {
        throw new Error("Todo not found");
    }

    return { message: "Todo deleted successfully" };
};

export const checkUpcomingTasks = async () => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const tasks = await Todo.find({
        dateTime: { $gt: now, $lte: threeDaysLater },
        reminderSent: false,
        completed: false,
    }).populate("created_by");

    for (const task of tasks) {
        if (task.created_by && task.created_by.email) {
            try {
                await sendTaskReminderEmail(task.created_by.email, task.title, task.dateTime);
                task.reminderSent = true;
                await task.save();
                console.log(`Reminder sent for task: ${task.title}`);
            } catch (error) {
                console.error(`Failed to send reminder for task ${task._id}:`, error);
            }
        }
    }
};
