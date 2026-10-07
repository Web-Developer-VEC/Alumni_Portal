import express from "express";
import {
  getProfileByToken,
  updateProfileByToken,
} from "../../controllers/general/profile.controller.js";
import {
  getUserPostsByToken,
  deletePostByToken,
} from "../../controllers/general/post.controller.js";
import { uploadProfilePic } from "../../middleware/upload.middleware.js";

const router = express.Router();

// ==========================================
// PROFILE ROUTES
// ==========================================
// Fetch profile details by token
router.get("/profile", getProfileByToken);
router.post("/profile", getProfileByToken);

// Update profile details (supports JSON & multipart/form-data with profilePic)
router.put("/profile", uploadProfilePic, updateProfileByToken);
router.patch("/profile", uploadProfilePic, updateProfileByToken);
router.post("/profile/update", uploadProfilePic, updateProfileByToken);

// ==========================================
// USER POSTS ROUTES
// ==========================================
// Get all posts created by user (approved & pending)
router.get("/posts", getUserPostsByToken);
router.post("/posts", getUserPostsByToken);
router.get("/my-posts", getUserPostsByToken);
router.post("/my-posts", getUserPostsByToken);

// Delete post by ID
router.delete("/posts/:id", deletePostByToken);
router.delete("/posts", deletePostByToken);
router.delete("/my-posts/:id", deletePostByToken);
router.delete("/my-posts", deletePostByToken);

export default router;
