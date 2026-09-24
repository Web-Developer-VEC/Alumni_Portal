import type { Request, Response, NextFunction } from "express";
import multer from "multer";

// Configure multer to store files in memory before uploading to S3
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (JPEG, PNG, WEBP, GIF, etc.) are allowed!"));
    }
  },
});

// Support common image field names so both 'profilePic', 'profilePicture', etc. work
const uploadFields = upload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "profilePicture", maxCount: 1 },
  { name: "avatar", maxCount: 1 },
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

export const uploadProfilePic = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  uploadFields(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ message: "Image exceeds maximum allowed size of 5MB" });
        return;
      }
      res.status(400).json({ message: `File upload error: ${err.message}` });
      return;
    } else if (err instanceof Error) {
      res.status(400).json({ message: err.message });
      return;
    } else if (err) {
      res.status(400).json({ message: "Unknown file upload error" });
      return;
    }

    // Normalize any uploaded field file onto req.file
    if (req.files && !Array.isArray(req.files)) {
      const filesObj = req.files as Record<string, Express.Multer.File[]>;
      const matchedFile =
        filesObj["profilePic"]?.[0] ||
        filesObj["profilePicture"]?.[0] ||
        filesObj["avatar"]?.[0] ||
        filesObj["image"]?.[0] ||
        filesObj["file"]?.[0];

      if (matchedFile) {
        req.file = matchedFile;
      }
    }

    next();
  });
};
