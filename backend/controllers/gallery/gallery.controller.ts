// controllers/gallery/gallery.controller.ts

import { type Request, type Response } from "express";
import path from "path";

import {
  uploadFileToS3
} from "../../service/s3Upload.js";
import { deleteFileFromS3 } from "../../service/s3Delete.js";

import Gallery from "../../models/gallery.js";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);

// ======================================================
// UPLOAD GALLERY PHOTOS
// POST /gallery
//
// multipart/form-data
//
// photos  -> multiple image files
// caption -> optional caption
// ======================================================

export const uploadGalleryPhotos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as
      | Express.Multer.File[]
      | undefined;

    const { caption } = req.body;

    // -----------------------------------------
    // Check files
    // -----------------------------------------

    if (!files || files.length === 0) {
      res.status(400).json({
        message: "At least one photo is required",
      });

      return;
    }

    // -----------------------------------------
    // Validate files
    // -----------------------------------------

    const invalid = files.find((file) => {
      const extension = path
        .extname(file.originalname)
        .toLowerCase();

      const validMime = ALLOWED_TYPES.has(
        file.mimetype
      );

      const validExtension =
        ALLOWED_EXTENSIONS.has(extension);

      return !validMime && !validExtension;
    });

    if (invalid) {
      res.status(400).json({
        message: `Unsupported file type: ${invalid.mimetype}`,
        file: invalid.originalname,
      });

      return;
    }

    // -----------------------------------------
    // Upload all files in parallel
    // -----------------------------------------

    const newPhotos = await Promise.all(
      files.map(async (file) => {
        const extension = path
          .extname(file.originalname)
          .toLowerCase();

        // -------------------------------------
        // Correct MIME type
        // -------------------------------------

        let contentType = file.mimetype;

        if (
          file.mimetype ===
          "application/octet-stream"
        ) {
          const mimeByExtension: Record<
            string,
            string
          > = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
          };

          contentType =
            mimeByExtension[extension] ||
            file.mimetype;
        }

        // -------------------------------------
        // Unique S3 filename
        // -------------------------------------

        const randomString =
          Math.random()
            .toString(36)
            .substring(2, 8);

        const fileName =
          `gallery/${Date.now()}-${randomString}${extension}`;

        // -------------------------------------
        // Upload to S3
        // -------------------------------------

        const imageUrl = await uploadFileToS3(
          file.buffer,
          fileName,
          contentType
        );

        // -------------------------------------
        // Return photo object
        // -------------------------------------

        return {
          imageUrl,
          caption: caption || "",
        };
      })
    );

    // -----------------------------------------
    // Add photos to existing Gallery document
    // -----------------------------------------

    const gallery = await Gallery.findOneAndUpdate(
      {},
      {
        $push: {
          photos: {
            $each: newPhotos,
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // -----------------------------------------
    // Response
    // -----------------------------------------

    res.status(201).json({
      message: "Photos uploaded successfully",
      photos: newPhotos,
      gallery,
    });
  } catch (error) {
    console.error(
      "Gallery upload error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error while uploading photos",
    });
  }
};

// ======================================================
// GET GALLERY PHOTOS
// GET /gallery
// ======================================================

export const getGalleryPhotos = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const gallery = await Gallery.findOne({});

    res.status(200).json({
      photos: gallery?.photos || [],
    });
  } catch (error) {
    console.error(
      "Fetch gallery error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error while fetching photos",
    });
  }
};

// ======================================================
// DELETE ONE OR MULTIPLE GALLERY PHOTOS
// POST /gallery/delete
// ======================================================

export const deleteGalleryPhotos = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { photoIds } = req.body;

    // -----------------------------------------
    // Validate
    // -----------------------------------------

    if (
      !Array.isArray(photoIds) ||
      photoIds.length === 0
    ) {
      res.status(400).json({
        message: "photoIds must be a non-empty array",
      });

      return;
    }

    // -----------------------------------------
    // Find gallery
    // -----------------------------------------

    const gallery = await Gallery.findOne({});

    if (!gallery) {
      res.status(404).json({
        message: "Gallery not found",
      });

      return;
    }

    // -----------------------------------------
    // Find photos
    // -----------------------------------------

    const photosToDelete = gallery.photos.filter(
      (photo) =>
        photo._id &&
        photoIds.includes(
          photo._id.toString()
        )
    );

    if (photosToDelete.length === 0) {
      res.status(404).json({
        message: "No matching photos found",
      });

      return;
    }

    // -----------------------------------------
    // Delete files from S3 in parallel
    // -----------------------------------------

    await Promise.all(
      photosToDelete.map((photo) =>
        deleteFileFromS3(photo.imageUrl)
      )
    );

    // -----------------------------------------
    // Remove from MongoDB
    // -----------------------------------------

    for (const photoId of photoIds) {
      gallery.photos.pull(photoId);
    }

    await gallery.save();

    // -----------------------------------------
    // Response
    // -----------------------------------------

    res.status(200).json({
      message: "Photos deleted successfully",

      deletedCount: photosToDelete.length,

      deletedPhotoIds: photosToDelete.map(
        (photo) => photo._id
      ),
    });
  } catch (error) {
    console.error(
      "Gallery delete error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error while deleting photos",
    });
  }
};