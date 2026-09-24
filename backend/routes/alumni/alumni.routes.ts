import express from "express";
import { completeProfile } from "../../controllers/alumni/alumni.controller.js";
import {
  getAllAlumniDetails,
  getAlumniById,
} from "../../controllers/alumni/getalumnidetails.controller.js";

const router = express.Router();

router.post("/complete-profile", completeProfile);

router.get("/details", getAllAlumniDetails);
router.get("/:id", getAlumniById);

export default router;
