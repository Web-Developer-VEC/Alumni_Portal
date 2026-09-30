import { type Request, type Response } from "express";
import path from "path";
import mongoose from "mongoose";

import { uploadFileToS3 } from "../../service/s3Upload.js";
import { deleteFileFromS3 } from "../../service/s3Delete.js";

import Gallery from "../../models/gallery.js";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const isValidIdArray = (ids: unknown): ids is string[] =>
  Array.isArray(ids) &&
  ids.length > 0 &&
  ids.every((id) => typeof id === "string" && mongoose.isValidObjectId(id));

// ======================================================
// UPLOAD  (creates ONE gallery document per request)
// POST /gallery
//
// multipart/form-data
// photos  -> one or more image files
// caption -> optional caption shared by these images
// ======================================================

export const uploadGalleryPhotos = async (
  req: Request,
  res: Response
): Promise<void> => {
  const uploadedUrls: string[] = [];

  try {
    const files = req.files as Express.Multer.File[] | undefined;
    const { caption } = req.body;

    if (!files || files.length === 0) {
      res.status(400).json({ message: "At least one photo is required" });
      return;
    }

    const invalid = files.find((file) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const validMime = ALLOWED_TYPES.has(file.mimetype);
      const validExtension = ALLOWED_EXTENSIONS.has(extension);
      return !validMime && !validExtension;
    });

    if (invalid) {
      res.status(400).json({
        message: `Unsupported file type: ${invalid.mimetype}`,
        file: invalid.originalname,
      });
      return;
    }

    // Upload all files to S3 in parallel
    const images = await Promise.all(
      files.map(async (file) => {
        const extension = path.extname(file.originalname).toLowerCase();

        let contentType = file.mimetype;
        if (file.mimetype === "application/octet-stream") {
          contentType = MIME_BY_EXTENSION[extension] || file.mimetype;
        }

        const randomString = Math.random().toString(36).substring(2, 8);
        const fileName = `gallery/${Date.now()}-${randomString}${extension}`;

        const imageUrl = await uploadFileToS3(
          file.buffer,
          fileName,
          contentType
        );

        uploadedUrls.push(imageUrl);
        return { imageUrl };
      })
    );

    // One new document per upload
    const gallery = await Gallery.create({
      caption: caption || "",
      images,
    });

    res.status(201).json({
      message: "Gallery created successfully",
      gallery,
    });
  } catch (error) {
    console.error("Gallery upload error:", error);

    // Clean up any files already sent to S3 so they don't get orphaned
    await Promise.allSettled(uploadedUrls.map((url) => deleteFileFromS3(url)));

    res.status(500).json({
      message: "Internal server error while uploading photos",
    });
  }
};

// ======================================================
// GET ALL GALLERIES (newest first)
// GET /gallery
// ======================================================

export const getGalleryPhotos = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const galleries = await Gallery.find({}).sort({ createdAt: -1 });

    res.status(200).json({ galleries });
  } catch (error) {
    console.error("Fetch gallery error:", error);

    res.status(500).json({
      message: "Internal server error while fetching photos",
    });
  }
};

// ======================================================
// GET ONE GALLERY
// GET /gallery/:galleryId
// ======================================================

export const getGalleryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { galleryId } = req.params;

    if (!mongoose.isValidObjectId(galleryId)) {
      res.status(400).json({ message: "Invalid gallery id" });
      return;
    }

    const gallery = await Gallery.findById(galleryId);

    if (!gallery) {
      res.status(404).json({ message: "Gallery not found" });
      return;
    }

    res.status(200).json({ gallery });
  } catch (error) {
    console.error("Fetch gallery by id error:", error);

    res.status(500).json({
      message: "Internal server error while fetching gallery",
    });
  }
};

// ======================================================
// DELETE ONE OR MORE WHOLE GALLERIES (with all their images)
// POST /gallery/delete
// body: { galleryIds: string[] }
// ======================================================

export const deleteGalleries = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { galleryIds } = req.body;

    if (!isValidIdArray(galleryIds)) {
      res.status(400).json({
        message: "galleryIds must be a non-empty array of valid ids",
      });
      return;
    }

    const galleries = await Gallery.find({ _id: { $in: galleryIds } });

    if (galleries.length === 0) {
      res.status(404).json({ message: "No matching galleries found" });
      return;
    }

    // Delete every image of every matched gallery from S3
    const urls = galleries.flatMap((g) => g.images.map((img) => img.imageUrl));
    await Promise.all(urls.map((url) => deleteFileFromS3(url)));

    await Gallery.deleteMany({ _id: { $in: galleries.map((g) => g._id) } });

    res.status(200).json({
      message: "Galleries deleted successfully",
      deletedCount: galleries.length,
      deletedGalleryIds: galleries.map((g) => g._id),
    });
  } catch (error) {
    console.error("Gallery delete error:", error);

    res.status(500).json({
      message: "Internal server error while deleting galleries",
    });
  }
};

// ======================================================
// DELETE SPECIFIC IMAGES INSIDE ONE GALLERY
// POST /gallery/:galleryId/images/delete
// body: { imageIds: string[] }
// If the gallery ends up empty, the document is removed too.
// ======================================================

export const deleteGalleryImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { galleryId } = req.params;
    const { imageIds } = req.body;

    if (!mongoose.isValidObjectId(galleryId)) {
      res.status(400).json({ message: "Invalid gallery id" });
      return;
    }

    if (!isValidIdArray(imageIds)) {
      res.status(400).json({
        message: "imageIds must be a non-empty array of valid ids",
      });
      return;
    }

    const gallery = await Gallery.findById(galleryId);

    if (!gallery) {
      res.status(404).json({ message: "Gallery not found" });
      return;
    }

    const imagesToDelete = gallery.images.filter(
      (img) => img._id && imageIds.includes(img._id.toString())
    );

    if (imagesToDelete.length === 0) {
      res.status(404).json({ message: "No matching images found" });
      return;
    }

    await Promise.all(
      imagesToDelete.map((img) => deleteFileFromS3(img.imageUrl))
    );

    for (const img of imagesToDelete) {
      gallery.images.pull(img._id);
    }

    let galleryDeleted = false;

    if (gallery.images.length === 0) {
      await gallery.deleteOne();
      galleryDeleted = true;
    } else {
      await gallery.save();
    }

    res.status(200).json({
      message: "Images deleted successfully",
      deletedCount: imagesToDelete.length,
      galleryDeleted,
      gallery: galleryDeleted ? null : gallery,
    });
  } catch (error) {
    console.error("Gallery image delete error:", error);

    res.status(500).json({
      message: "Internal server error while deleting images",
    });
  }
};