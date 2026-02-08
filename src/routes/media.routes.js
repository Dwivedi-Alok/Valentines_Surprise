import express from "express";
import Media from "../models/media.model.js";
import Couple from "../models/couple.model.js";
import User from "../models/user.model.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { sendNewContentEmail } from "../services/mail.service.js";

const router = express.Router();

// Get all media for user's couple
router.get("/", protectRoute, async (req, res) => {
    try {
        const couple = await Couple.findByUser(req.user._id);

        if (!couple) {
            return res.json({ media: [] });
        }

        const media = await Media.find({ couple: couple._id })
            .populate("uploaded_by", "first_name last_name")
            .sort({ createdAt: -1 });

        res.json({ media });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save media record after S3 upload
router.post("/", protectRoute, async (req, res) => {
    try {
        const { type, title, description, s3_key, content_type, size_bytes } = req.body;

        if (!type || !title || !s3_key) {
            return res.status(400).json({ error: "Type, title, and s3_key are required" });
        }

        const couple = await Couple.findByUser(req.user._id);

        if (!couple) {
            return res.status(400).json({ error: "You need to create or join a couple first" });
        }

        const media = await Media.create({
            couple: couple._id,
            uploaded_by: req.user._id,
            type,
            title,
            description,
            s3_key,
            content_type,
            size_bytes,
        });

        // Notify partner about new media
        if (couple.status === "accepted") {
            const creatorName = `${req.user.first_name} ${req.user.last_name || ""}`.trim();

            // Find partner - handle both populated objects and plain IDs
            const user1Id = couple.user1._id ? couple.user1._id.toString() : couple.user1.toString();
            const user2Id = couple.user2?._id ? couple.user2._id.toString() : couple.user2?.toString();
            const partnerId = user1Id === req.user._id.toString() ? user2Id : user1Id;

            if (partnerId) {
                const partner = await User.findById(partnerId);
                if (partner && partner.email) {
                    const partnerName = `${partner.first_name} ${partner.last_name || ""}`.trim();
                    await sendNewContentEmail(partner.email, partnerName, creatorName, type, title);
                }
            }
        }

        res.status(201).json({ media: await media.populate("uploaded_by", "first_name last_name") });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete media
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const couple = await Couple.findByUser(req.user._id);

        if (!couple) {
            return res.status(403).json({ error: "Not authorized" });
        }

        const media = await Media.findOne({
            _id: req.params.id,
            couple: couple._id,
        });

        if (!media) {
            return res.status(404).json({ error: "Media not found" });
        }

        await Media.deleteOne({ _id: media._id });
        res.json({ message: "Media deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
