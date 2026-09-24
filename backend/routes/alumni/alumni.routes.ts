import express from "express";
import { completeProfile } from "../../controllers/alumni/alumni.controller.js";
const router = express.Router();


router.post("/complete-profile", completeProfile);

export default router;
