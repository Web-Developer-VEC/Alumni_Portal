import express from "express";
import multer from "multer";

import {
  uploadGalleryPhotos,
  getGalleryPhotos,
  deleteGalleryPhotos,
} from "../../controllers/gallery/gallery.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 20,
  },
});

// Upload
router.post(
  "/",
  upload.array("photos", 20),
  uploadGalleryPhotos
);

// Get
router.get(
  "/",
  getGalleryPhotos
);

// Delete
router.post(
  "/delete",
  deleteGalleryPhotos   
);
export default router;