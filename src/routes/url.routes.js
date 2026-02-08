import express from "express";
import { createUrl, getUrls, deleteUrl } from "../services/url.service.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", async (req, res) => {
    try {
        const { url, title } = req.body;
        const result = await createUrl({ url, title, userId: req.user._id });
        res.status(201).json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

router.get("/", async (req, res) => {
    try {
        const urls = await getUrls(req.user._id);
        res.json(urls);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const result = await deleteUrl(req.params.id, req.user._id);
        res.json(result);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

export default router;
