import type { Request, Response } from "express";
import Post from "../../models/post.js";
import PrePost from "../../models/prePost.js";
import User from "../../models/User.js";
import {
  extractTokenFromRequest,
  decodeJwtToken,
} from "./profile.controller.js";

/**
 * Controller to decode token, retrieve email, and return all posts created by the user
 */
export const getUserPostsByToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const token = extractTokenFromRequest(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token is required",
      });
      return;
    }

    const decoded = decodeJwtToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired authentication token",
      });
      return;
    }

    let email = typeof decoded.email === "string" ? decoded.email.trim() : "";
    const userId = (decoded.id || decoded._id || decoded.userId) as string | undefined;

    // Resolve user by ID or email
    const userQuery: Record<string, unknown>[] = [];
    if (email) {
      userQuery.push({ email: email.toLowerCase().trim() });
      userQuery.push({ email: email.trim() });
    }
    if (userId) {
      userQuery.push({ _id: userId });
    }

    if (userQuery.length === 0) {
      res.status(400).json({
        success: false,
        message: "User identity could not be determined from the token",
      });
      return;
    }

    const user = await User.findOne({ $or: userQuery })
      .select("-password")
      .lean();

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found in database",
      });
      return;
    }

    const userObjectId = user._id;

    // 1. Fetch approved posts from Post collection
    const approvedPosts = await Post.find({ author: userObjectId })
      .populate("author", "name displayName email profilePic")
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch pending or rejected posts from PrePost collection
    const prePosts = await PrePost.find({ author: userObjectId })
      .populate("author", "name displayName email profilePic")
      .sort({ createdAt: -1 })
      .lean();

    const formattedApproved = approvedPosts.map((p) => ({
      ...p,
      status: "APPROVED",
    }));

    // Merge all posts and sort by creation date descending
    const allPosts: any[] = [...formattedApproved, ...prePosts].sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Optional status filter (?status=APPROVED | PENDING | REJECTED | ALL)
    const statusQuery = (req.query.status as string)?.toUpperCase();
    let filteredPosts = allPosts;

    if (statusQuery && statusQuery !== "ALL") {
      filteredPosts = allPosts.filter((p: any) => p.status === statusQuery);
    }

    const summary = {
      total: allPosts.length,
      approved: approvedPosts.length,
      pending: prePosts.filter((p) => p.status === "PENDING").length,
      rejected: prePosts.filter((p) => p.status === "REJECTED").length,
    };

    res.status(200).json({
      success: true,
      message: "User posts fetched successfully",
      email: user.email,
      count: filteredPosts.length,
      summary,
      posts: filteredPosts,
      allPosts,
      approvedPosts: formattedApproved,
      pendingPosts: prePosts.filter((p) => p.status === "PENDING"),
      rejectedPosts: prePosts.filter((p) => p.status === "REJECTED"),
    });
  } catch (error) {
    console.error("getUserPostsByToken error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching user posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
