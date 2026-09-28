import express from "express";
import multer from "multer";

import {
  createEvent,
  getAllEvents,
} from "../../controllers/event/event.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Create event
router.post(
  "/",
  upload.single("image"),
  createEvent
);

// Get all events
router.get(
  "/",
  getAllEvents
);

export default router;