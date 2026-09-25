import express from "express";
import { approveUser, rejectUser } from "../../controllers/HOD/hodapproval.controller.js";
import {
  getPendingPosts,
  getPendingPostById,
  approvePost,
  rejectPost,
  deletePrePost,
} from "../../controllers/HOD/hodpost.controller.js";

const router = express.Router();

// =============================================
// USER APPROVAL ROUTES
// =============================================
// Approve user profile
router.patch("/approve/:id", approveUser);

// Reject user profile with reason in request body
router.patch("/reject/:id", rejectUser);

// =============================================
// POST APPROVAL ROUTES (pre_post -> post)
// =============================================
// Get all pending posts waiting for HOD approval
router.get("/posts/pending", getPendingPosts);

// Get single pending post by id
router.get("/posts/pending/:id", getPendingPostById);

// Approve post and move from pre_post collection to post collection
router.patch("/posts/approve/:id", approvePost);
router.patch("/approve-post/:id", approvePost);

// Reject post in pre_post collection with reason
router.patch("/posts/reject/:id", rejectPost);
router.patch("/reject-post/:id", rejectPost);

// Delete pending post from pre_post collection
router.delete("/posts/pending/:id", deletePrePost);

export default router;
