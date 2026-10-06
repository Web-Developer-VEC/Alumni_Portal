import express from "express";
import multer from "multer";

import {
  createPost,
  getPosts,
} from "../../controllers/posts/post.controller.js";

import {
  likePost,
  unlikePost,
  addComment,
  getComments,
  deleteComment,
} from "../../controllers/posts/likecomment.controller.js";
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


// Like a post       body: { postId, email, Userrole }
router.post("/like", likePost);

// Unlike a post     body: { postId, email, Userrole }
router.delete("/like", unlikePost);

// -----------------------------------------
// Comments
// -----------------------------------------

// List comments     body: { postId }
router.post("/comments/list", getComments);

// Add a comment     body: { postId, email, Userrole, text }
router.post("/comments", addComment);


// Delete a comment  body: { postId, commentId, email, Userrole }
router.delete("/comments", deleteComment);

export default router;