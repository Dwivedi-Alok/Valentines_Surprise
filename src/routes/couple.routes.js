import express from "express";
import Couple from "../models/couple.model.js";
import User from "../models/user.model.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { sendPartnerInviteEmail, sendPartnerRemovedEmail } from "../services/mail.service.js";

const router = express.Router();

// Get couple info for current user
router.get("/", protectRoute, async (req, res) => {
    try {
        const couple = await Couple.findByUser(req.user._id);
        console.log(`[GET /couple] User: ${req.user._id} (${req.user.email}), Found: ${couple ? couple._id : 'null'}`);

        if (!couple) {
            return res.json({ couple: null });
        }

        res.json({ couple });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Invite partner
router.post("/invite", protectRoute, async (req, res) => {
    try {
        const { email, first_name, last_name } = req.body;

        if (!email || !first_name) {
            return res.status(400).json({ error: "Email and first name are required" });
        }

        // Check if user already has a couple
        const existingCouple = await Couple.findByUser(req.user._id);
        if (existingCouple) {
            return res.status(400).json({ error: "You already have a partner" });
        }

        // Check if inviting yourself
        if (email.toLowerCase() === req.user.email) {
            return res.status(400).json({ error: "You cannot invite yourself" });
        }

        // Check if invited email is already in a couple
        const invitedUser = await User.findOne({ email: email.toLowerCase() });
        if (invitedUser) {
            const invitedCouple = await Couple.findByUser(invitedUser._id);
            if (invitedCouple) {
                return res.status(400).json({ error: "This person already has a partner" });
            }
        }

        // Create couple with pending status
        const couple = await Couple.create({
            user1: req.user._id,
            invite_email: email.toLowerCase(),
            invite_first_name: first_name,
            invite_last_name: last_name || "",
            status: "pending",
        });

        // Send invite email
        const inviterName = `${req.user.first_name} ${req.user.last_name || ""}`.trim();
        await sendPartnerInviteEmail(email, inviterName, first_name);

        res.json({
            message: "Invitation sent successfully! 💕",
            couple: await couple.populate("user1")
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Remove partner / cancel invite
router.delete("/", protectRoute, async (req, res) => {
    try {
        const couple = await Couple.findByUser(req.user._id);

        if (!couple) {
            return res.status(404).json({ error: "No couple found" });
        }

        // Get partner info for notification BEFORE deleting
        const currentUserName = `${req.user.first_name} ${req.user.last_name || ""}`.trim();
        let partnerEmail = null;
        let partnerName = null;

        if (couple.status === "accepted" && couple.user2) {
            // Handle both populated objects and plain IDs
            const user1Id = couple.user1._id ? couple.user1._id.toString() : couple.user1.toString();
            const partner = user1Id === req.user._id.toString() ? couple.user2 : couple.user1;

            if (partner && partner.email) {
                partnerEmail = partner.email;
                partnerName = `${partner.first_name} ${partner.last_name || ""}`.trim();
            }
        } else if (couple.status === "pending" && couple.invite_email) {
            partnerEmail = couple.invite_email;
            partnerName = couple.invite_first_name;
        }

        // Delete the couple first (important - don't let email failure block this)
        await Couple.deleteOne({ _id: couple._id });

        // Try to send removal email (non-blocking, don't fail if email fails)
        if (partnerEmail) {
            sendPartnerRemovedEmail(partnerEmail, partnerName, currentUserName)
                .catch(err => console.error("Failed to send partner removal email:", err.message));
        }

        res.json({ message: "Partner removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get pending requests for current user
router.get("/requests", protectRoute, async (req, res) => {
    try {
        const requests = await Couple.find({
            $or: [{ user2: req.user._id }, { invite_email: req.user.email }],
            status: "pending"
        }).populate("user1", "first_name last_name email"); // Populate sender info

        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Accept a request
router.post("/accept/:id", protectRoute, async (req, res) => {
    try {
        const couple = await Couple.findById(req.params.id);

        if (!couple) {
            return res.status(404).json({ error: "Request not found" });
        }

        // Verify this request is for the current user
        if (couple.user2?.toString() !== req.user._id.toString() && couple.invite_email !== req.user.email) {
            return res.status(403).json({ error: "Not authorized to accept this request" });
        }

        // Update status
        couple.status = "accepted";
        couple.accepted_at = new Date();
        couple.user2 = req.user._id; // Ensure user2 is set
        await couple.save();

        // Optional: Delete other pending requests for this user?
        // For now, let's keep them or maybe mark them as rejected?
        // await Couple.deleteMany({
        //     $or: [{ user2: req.user._id }, { invite_email: req.user.email }],
        //     status: "pending",
        //     _id: { $ne: couple._id }
        // });

        res.json({ message: "Partner request accepted! 💕", couple });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send Kiss
router.post("/kiss", protectRoute, async (req, res) => {
    try {
        const couple = await Couple.findByUser(req.user._id);

        if (!couple || couple.status !== "accepted") {
            return res.status(400).json({ error: "You need an accepted partner to send a kiss!" });
        }

        // Handle both populated objects and plain IDs
        const user1Id = couple.user1._id ? couple.user1._id.toString() : couple.user1.toString();
        const user2Id = couple.user2._id ? couple.user2._id.toString() : couple.user2.toString();

        const partnerId = user1Id === req.user._id.toString() ? user2Id : user1Id;

        const partner = await User.findById(partnerId);

        if (!partner || !partner.email) {
            return res.status(404).json({ error: "Partner not found" });
        }

        const senderName = `${req.user.first_name} ${req.user.last_name || ""}`.trim();
        await import("../services/mail.service.js").then(service =>
            service.sendKissEmail(partner.email, senderName)
        );

        res.json({ message: "Kiss sent! 💋" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
