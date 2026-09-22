import express, { type Request, type Response } from "express";
import multer from "multer";
import { uploadFileToS3 } from "../service/s3Upload.js";

const router = express.Router();

// Configure multer to store files in memory before uploading to S3
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const { originalname, buffer, mimetype } = req.file;

    // Generate a unique filename using timestamp
    const uniqueFileName = `${Date.now()}-${originalname}`;

    const fileUrl = await uploadFileToS3(buffer, uniqueFileName, mimetype);

    res.status(200).json({
      message: "File uploaded successfully",
      url: fileUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error during upload" });
  }
});

export default router;
