import express from "express";
import { completeProfile } from "../../controllers/alumni/alumni.controller.js";
import {
  getAllAlumniDetails,
  getAlumniById,
} from "../../controllers/alumni/getalumnidetails.controller.js";
import { uploadProfilePic } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.post("/complete-profile", uploadProfilePic, completeProfile);

router.get("/details", getAllAlumniDetails);
router.get("/id", getAlumniById);

export default router;

