import express from "express";
import { approveUser, rejectUser } from "../../controllers/HOD/hodapproval.controller.js";

const router = express.Router();

// Approve user profile
router.patch("/approve/:id", approveUser);

// Reject user profile with reason in request body
router.patch("/reject/:id", rejectUser);

export default router;
