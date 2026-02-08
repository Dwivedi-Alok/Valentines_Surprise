import express from "express";
import User from "../models/user.model.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Update profile (address, favorites)
router.put("/", protectRoute, async (req, res) => {
    try {
        const { address, favorites } = req.body;

        const updates = {};
        if (address !== undefined) updates.address = address;
        if (favorites !== undefined) updates.favorites = favorites;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        );

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update partner's favorites
router.put("/partner", protectRoute, async (req, res) => {
    try {
        const { favorites } = req.body;
        if (favorites === undefined) {
            return res.status(400).json({ error: "Favorites content is required" });
        }

        // Find couple
        const { default: Couple } = await import("../models/couple.model.js");
        const couple = await Couple.findByUser(req.user._id);

        if (!couple || couple.status !== "accepted") {
            return res.status(400).json({ error: "You need an active partner to do this" });
        }

        // Identify partner
        // Identify partner
        const partnerId = couple.user1._id.toString() === req.user._id.toString()
            ? couple.user2._id
            : couple.user1._id;

        // Update partner
        const partner = await User.findByIdAndUpdate(
            partnerId,
            { favorites },
            { new: true }
        );

        res.json({ partner });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
