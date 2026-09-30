import express from "express";
import multer from "multer";
import {
  getPendingAlumni,
  getPendingUserById,
  approveUser,
  rejectUser,
} from "../../controllers/HOD/hodapproval.controller.js";
import {
  getPendingPosts,
  getPendingPostById,
  approvePost,
  rejectPost,
  deletePrePost,
  createHODEvent,
  getHODEvents,
  updateHODEvent,
  deleteHODEvent,
} from "../../controllers/HOD/hodpost.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB max
  },
});

// =============================================
// USER / ALUMNI APPROVAL ROUTES
// =============================================
// Get all pending alumni waiting for HOD approval
router.get("/users/pending", getPendingAlumni);
router.get("/alumni/pending", getPendingAlumni);
router.get("/pending", getPendingAlumni);

// Get single pending alumni by id
router.get("/users/pending/:id", getPendingUserById);
router.get("/alumni/pending/:id", getPendingUserById);

// USER APPROVAL ROUTES
// =============================================
// Approve user profile
router.patch("/approve/:id", approveUser);
router.patch("/users/approve/:id", approveUser);
router.patch("/alumni/approve/:id", approveUser);

// Reject user profile with reason in request body
router.patch("/reject/:id", rejectUser);
router.patch("/users/reject/:id", rejectUser);
router.patch("/alumni/reject/:id", rejectUser);

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

// =============================================
// HOD EVENT MANAGEMENT ROUTES
// =============================================
// Create and post event by HOD (supports single image upload)
router.post("/events", upload.single("image"), createHODEvent);
router.post("/event", upload.single("image"), createHODEvent);

// Get all events for HOD management
router.get("/events", getHODEvents);

// Update event by HOD (supports single image replacement)
router.put("/events/:id", upload.single("image"), updateHODEvent);
router.patch("/events/:id", upload.single("image"), updateHODEvent);

// Delete event by HOD
router.delete("/events/:id", deleteHODEvent);

export default router;
