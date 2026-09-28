import express from "express";
import multer from "multer";
import { authenticate } from "../../middleware/authenticate.js";
import { createPost, getPosts } from "../../controllers/posts/post.controller.js";

const router = express.Router();

// Configure multer to store files in memory before uploading to S3
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit per file
});

router.post("/", authenticate, upload.array("files"), createPost);
router.get("/", getPosts);

export default router;