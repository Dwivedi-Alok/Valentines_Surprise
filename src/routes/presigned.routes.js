
import express from "express";
import { generateUploadUrl, generateViewUrl, listObjectsInFolder } from "../services/presigned.service.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();



router.get("/upload", protectRoute, async (req, res) => {
  try {
    const { fileName, contentType, type } = req.query;

    let folder = "others";

    if (type === "profile") folder = "profile-pictures";
    else if (type === "video") folder = "media/videos";
    else if (type === "audio") folder = "media/audio";
    else if (type === "image") folder = "media/images";
    else if (type === "document") folder = "documents";

    const data = await generateUploadUrl({ fileName, contentType, folder });

    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});




router.get("/view", protectRoute, async (req, res) => {
  try {
    const { key } = req.query;
    const viewUrl = await generateViewUrl(key);
    res.json({ viewUrl });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get("/list", protectRoute, async (req, res) => {
  try {
    const { type } = req.query;

    let folder = "others";
    if (type === "profile") folder = "profile-pictures";
    else if (type === "video") folder = "media/videos";
    else if (type === "image") folder = "media/images";
    else if (type === "document") folder = "documents";

    const files = await listObjectsInFolder(folder);
    res.json(files);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
