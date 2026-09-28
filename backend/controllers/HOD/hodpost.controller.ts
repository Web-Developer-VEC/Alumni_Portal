import type { Request, Response } from "express";
import PrePost from "../../models/prePost.js";
import Post from "../../models/post.js";

/**
 * Get all posts waiting for HOD approval from pre_post collection.
 * Supports optional status query (?status=PENDING | APPROVED | REJECTED).
 * Defaults to PENDING.
 */
export const getPendingPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: Record<string, unknown> = {};

    if (status && typeof status === "string") {
      filter.status = status.toUpperCase();
    } else {
      filter.status = "PENDING";
    }

    const posts = await PrePost.find(filter)
      .populate("author", "name email photo displayName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    console.error("getPendingPosts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending posts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get a single post from pre_post collection by ID.
 * Expected params: { id: string }
 */
export const getPendingPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    const post = await PrePost.findById(postId)
      .populate("author", "name email photo displayName");

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    console.error("getPendingPostById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Approve a post from pre_post collection and move it to the post collection.
 * Expected params: { id: string } (post id)
 */
export const approvePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    // 1. Find the post in pre_post collection
    const prePost = await PrePost.findById(postId);
    if (!prePost) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    // 2. Prepare post data for the post collection
    const prePostObj = prePost.toObject();
    const { _id, __v, status, rejectReason, createdAt, updatedAt, ...cleanPostData } = prePostObj;

    // 3. Insert into the post collection preserving the original _id
    const newPost = await Post.create({
      _id,
      ...cleanPostData,
    });

    // 4. Delete the post from pre_post collection after successful insert
    try {
      await PrePost.findByIdAndDelete(postId);
    } catch (delError) {
      // Rollback newly created post if delete from pre_post fails
      await Post.findByIdAndDelete(newPost._id);
      throw delError;
    }

    // 5. Populate author info for the response
    await newPost.populate("author", "name email photo displayName");

    res.status(200).json({
      success: true,
      message: "Post approved and successfully moved to post collection",
      post: newPost,
    });
  } catch (error) {
    console.error("approvePost error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Reject a post in pre_post collection with optional reason.
 * Expected params: { id: string }, body: { reason?: string, delete?: boolean }
 */
export const rejectPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    const reason = req.body.reason?.trim();
    const shouldDelete = req.body.delete === true || req.query.action === "delete";

    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    const prePost = await PrePost.findById(postId);
    if (!prePost) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    if (shouldDelete) {
      await PrePost.findByIdAndDelete(postId);
      res.status(200).json({
        success: true,
        message: "Post rejected and deleted from pre_post collection",
      });
      return;
    }

    prePost.status = "REJECTED";
    if (reason) prePost.rejectReason = reason;
    await prePost.save();

    res.status(200).json({
      success: true,
      message: "Post marked as rejected",
      post: prePost,
    });
  } catch (error) {
    console.error("rejectPost error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete a post from pre_post collection.
 * Expected params: { id: string }
 */
export const deletePrePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id || req.body.id;
    if (!postId) {
      res.status(400).json({ success: false, message: "Post ID is required" });
      return;
    }

    const deleted = await PrePost.findByIdAndDelete(postId);
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Post not found in pre_post collection",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Post deleted from pre_post collection successfully",
    });
  } catch (error) {
    console.error("deletePrePost error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting post",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
