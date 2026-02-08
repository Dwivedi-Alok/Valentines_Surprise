import express from "express";
import Payment from "../models/payment.model.js";
import Couple from "../models/couple.model.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Get all payment methods (mine + partner's if couple accepted)
router.get("/", protectRoute, async (req, res) => {
    try {
        const couple = await Couple.findByUser(req.user._id);

        // Default query: Only user's payment methods
        let query = { user: req.user._id };
        let partnersPayments = [];

        // If couple exists and accepted, get partner's payments too
        if (couple && couple.status === "accepted") {
            const partnerId = couple.user1._id.toString() === req.user._id.toString()
                ? couple.user2._id
                : couple.user1._id;

            if (partnerId) {
                partnersPayments = await Payment.find({ user: partnerId }).sort({ createdAt: -1 });
            }
        }

        const myPayments = await Payment.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.json({
            myPayments,
            partnersPayments
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add payment method
router.post("/", protectRoute, async (req, res) => {
    try {
        const { type, title, value } = req.body;

        if (!type || !title || !value) {
            return res.status(400).json({ error: "Type, title, and value are required" });
        }

        const couple = await Couple.findByUser(req.user._id);

        const payment = await Payment.create({
            user: req.user._id,
            couple: couple?._id,
            type,
            title,
            value, // URL or S3 Key
        });

        res.status(201).json(payment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete payment method
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const payment = await Payment.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!payment) {
            return res.status(404).json({ error: "Payment method not found" });
        }

        res.json({ message: "Payment method deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
