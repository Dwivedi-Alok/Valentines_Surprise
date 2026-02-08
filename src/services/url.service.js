import Url from "../models/url.model.js";
import Couple from "../models/couple.model.js";
import User from "../models/user.model.js";
import { sendNewContentEmail } from "./mail.service.js";

export const createUrl = async ({ url, title, userId }) => {
    // Find user's couple (optional)
    const couple = await Couple.findByUser(userId);

    const newUrl = await Url.create({
        url,
        title,
        couple: couple?._id || null,
        user: userId,
        created_by: userId,
    });

    // Notify partner about new link
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
                await sendNewContentEmail(partner.email, partnerName, creatorName, "url", title);
            }
        }
    }

    return newUrl;
};

export const getUrls = async (userId) => {
    // Find user's couple
    const couple = await Couple.findByUser(userId);

    // If user has a couple, get all urls for that couple
    // Otherwise, get only user's personal urls
    const query = couple
        ? { couple: couple._id }
        : { user: userId };

    const urls = await Url.find(query)
        .populate("created_by", "first_name last_name")
        .sort({ createdAt: -1 });
    return urls;
};

export const deleteUrl = async (id, userId) => {
    // Find user's couple
    const couple = await Couple.findByUser(userId);

    // Build query - can delete if belongs to couple or user
    const query = couple
        ? { _id: id, couple: couple._id }
        : { _id: id, user: userId };

    const url = await Url.findOneAndDelete(query);
    if (!url) {
        throw new Error("Url not found");
    }
    return { message: "Url deleted successfully" };
};