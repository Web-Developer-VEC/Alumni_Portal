import { type Request, type Response } from "express";
import crypto from "crypto";
import path from "path";

import { uploadFileToS3 } from "../../service/s3Upload.js";
import Post from "../../models/post.js";
import PrePost from "../../models/prePost.js";
import User from "../../models/User.js";

const JOB_FIELDS = [
  "company",
  "role",
  "eligibility",
  "location",
  "type",
  "freshers",
  "remote",
  "referralAvailable",
  "highVolumeReferrals",
  "directReferral",
  "package",
  "deadline",
  "ppo",
  "hiringLoop",
  "skills",
  "pledge",
  "tags",
  "applyLink",
  "applyLabel",
  "author",
] as const;

// =============================================
// CREATE POST
// =============================================

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // -----------------------------------------
    // 1. User information
    // -----------------------------------------

    const { userId, email } = req.body;

    if (!userId || !email) {
      res.status(400).json({
        message: "User ID and email are required",
      });
      return;
    }

    // -----------------------------------------
    // 2. Post data
    // -----------------------------------------

    const {
      title,
      content,
      link,
      startTime,
      endTime,
    } = req.body;

    if (!title || !content) {
      res.status(400).json({
        message: "Title and content are required",
      });
      return;
    }

    // -----------------------------------------
    // 3. Validate dates
    // -----------------------------------------

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
      ) {
        res.status(400).json({
          message: "Invalid start or end time",
        });
        return;
      }

      if (end <= start) {
        res.status(400).json({
          message: "End time must be after start time",
        });
        return;
      }
    }

    // -----------------------------------------
    // 4. Find MongoDB user
    // -----------------------------------------

    const user = await User.findOne({
      _id: userId,
      email: email,
    });

    if (!user) {
      res.status(404).json({
        message: "User not found in database",
      });
      return;
    }

    // -----------------------------------------
    // 5. Create deterministic username hash
    // -----------------------------------------

    const username =
      user.name ||
      user.email?.split("@")[0] ||
      "user";

    const usernameHash = crypto
      .createHash("sha256")
      .update(username)
      .digest("hex")
      .slice(0, 10);

    // -----------------------------------------
    // 6. Upload files to S3
    // -----------------------------------------

    let fileUrls: string[] = [];

    const files = req.files as
      | Express.Multer.File[]
      | undefined;

    if (files && files.length > 0) {
      fileUrls = await Promise.all(
        files.map(async (file) => {
          // Generate random 5-character string
          const randomString = crypto
            .randomBytes(4)
            .toString("base64url")
            .slice(0, 5);

          // Get extension
          const extension = path.extname(
            file.originalname
          );

          // Final filename
          const fileName =
            `${usernameHash}_${randomString}${extension}`;

          // S3 path
          const s3Key =
            `posts/${usernameHash}/${fileName}`;

          // Upload to S3
          return uploadFileToS3(
            file.buffer,
            s3Key,
            file.mimetype
          );
        })
      );
    }

    // -----------------------------------------
    // 7. Job data
    // -----------------------------------------

    const jobData: Record<string, unknown> = {};

    for (const field of JOB_FIELDS) {
      const value = req.body[field];

      if (
        value !== undefined &&
        value !== ""
      ) {
        jobData[field] = value;
      }
    }

    // -----------------------------------------
    // 8. Parse skills
    // -----------------------------------------

    if (typeof jobData.skills === "string") {
      try {
        jobData.skills = JSON.parse(
          jobData.skills
        );
      } catch {
        jobData.skills = (
          jobData.skills as string
        )
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      }
    }

    // -----------------------------------------
    // 9. Parse tags
    // -----------------------------------------

    if (typeof jobData.tags === "string") {
      try {
        jobData.tags = JSON.parse(
          jobData.tags
        );
      } catch {
        jobData.tags = (
          jobData.tags as string
        )
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      }
    }

    // -----------------------------------------
    // 10. Create PrePost
    // -----------------------------------------

    const post = await PrePost.create({
      title,
      content,
      link,

      ...(startTime && {
        startTime,
      }),

      ...(endTime && {
        endTime,
      }),

      // MongoDB User _id
      author: user._id,

      // S3 file URLs
      fileUrls,

      // Job information
      ...jobData,

      // Waiting for HOD approval
      status: "PENDING",
    });

    // -----------------------------------------
    // 11. Response
    // -----------------------------------------

    res.status(201).json({
      success: true,
      message:
        "Post submitted successfully and pending HOD approval",
      post,
    });

  } catch (error) {
    console.error(
      "Post creation error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error while creating post",
    });
  }
};

// =============================================
// GET POSTS
// =============================================

export const getPosts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.find()
      .populate(
        "author",
        "name email photo"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      posts,
    });

  } catch (error) {
    console.error(
      "Fetch posts error:",
      error
    );

    res.status(500).json({
      message:
        "Internal server error while fetching posts",
    });
  }
};