import express from "express";
import multer from "multer";

import {
  createPost,
  getPosts,
} from "../../controllers/posts/post.controller.js";

const router = express.Router();

// Store files in memory before uploading to S3
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB per file
  },
});

// Create post
router.post(
  "/",
  upload.array("files"),
  createPost
);

// Get posts
router.get(
  "/",
  getPosts
);

export default router;