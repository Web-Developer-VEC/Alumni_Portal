import express from "express";
import {
  getLandingPageData,
  seedLandingData,
} from "../../controllers/landing/landing.controller.js";

const router = express.Router();

// Public landing page aggregate data
router.get("/", getLandingPageData);

// Endpoint to seed sample data into MongoDB
router.post("/seed", seedLandingData);
router.get("/seed", seedLandingData);

export default router;
