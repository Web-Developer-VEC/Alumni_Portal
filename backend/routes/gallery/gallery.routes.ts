import express from "express";
import multer from "multer";

import {
  uploadGalleryPhotos,
  getGalleryPhotos,
  getGalleryById,
  deleteGalleries,
  deleteGalleryImages,
} from "../../controllers/gallery/gallery.controller.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 20,
  },
});

// Create a gallery (caption + N images)
router.post("/", upload.array("photos", 20), uploadGalleryPhotos);

// List all galleries
router.get("/", getGalleryPhotos);

// Delete whole galleries  -> body: { galleryIds: [...] }
// (must be declared before "/:galleryId" routes)
router.post("/delete", deleteGalleries);

// Get one gallery
router.get("/:galleryId", getGalleryById);

// Delete specific images in a gallery -> body: { imageIds: [...] }
router.post("/:galleryId/images/delete", deleteGalleryImages);

export default router;