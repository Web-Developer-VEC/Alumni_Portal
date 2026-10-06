import { type Request, type Response } from "express";
import { Types, type HydratedDocument } from "mongoose";

import Post from "../../models/post.js";
import User, { type IUser } from "../../models/User.js";

const MAX_COMMENT_LENGTH = 500;
const USER_FIELDS = "name displayName username email profilePic";

// Roles allowed to delete other people's comments
const MODERATOR_ROLES = ["ADMIN"];

const VALID_ROLES: IUser["role"][] = ["ADMIN", "STUDENT", "ALUMNI"];

// -----------------------------------------
// Helpers  (everything is read from req.body only)
// -----------------------------------------

const isValidId = (id: unknown): id is string =>
  typeof id === "string" && Types.ObjectId.isValid(id);

/*
 * Reads `email` and `Userrole` from the request body and looks the
 * user up in MongoDB. Sends the error response itself and returns
 * null when the user cannot be resolved.
 */
const resolveUser = async (
  req: Request,
  res: Response
): Promise<HydratedDocument<IUser> | null> => {
  const { email, Userrole } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof Userrole !== "string" ||
    !email ||
    !Userrole
  ) {
    res.status(400).json({
      message: "User role and email are required",
    });
    return null;
  }

  if (!VALID_ROLES.includes(Userrole as IUser["role"])) {
    res.status(400).json({
      message: "Invalid user role",
    });
    return null;
  }

  const user = await User.findOne({
    role: Userrole as IUser["role"],
    email: email,
  });

  if (!user) {
    res.status(404).json({
      message: "User not found in database",
    });
    return null;
  }

  return user;
};

// =============================================
// TOGGLE LIKE  (POST /like)
// body: { postId, email, Userrole }
// =============================================

export const toggleLike = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.body ?? {};

    if (!isValidId(postId)) {
      res.status(400).json({ message: "Valid postId is required" });
      return;
    }

    const user = await resolveUser(req, res);
    if (!user) return;

    const userId = user._id;

    // Try to LIKE: only matches if this user has not liked yet
    const liked = await Post.updateOne(
      { _id: postId, likedBy: { $ne: userId } },
      { $addToSet: { likedBy: userId }, $inc: { likes: 1 } }
    );

    let isLiked = true;

    if (liked.modifiedCount === 0) {
      // Either already liked (-> UNLIKE) or post does not exist
      const unliked = await Post.updateOne(
        { _id: postId, likedBy: userId },
        { $pull: { likedBy: userId }, $inc: { likes: -1 } }
      );

      if (unliked.modifiedCount === 0) {
        res.status(404).json({ message: "Post not found" });
        return;
      }

      isLiked = false;
    }

    const post = await Post.findById(postId).select("likes");

    res.status(200).json({
      success: true,
      liked: isLiked,
      likes: post?.likes ?? 0,
    });
  } catch (error) {
    console.error("Toggle like error:", error);

    res.status(500).json({
      message: "Internal server error while updating like",
    });
  }
};

// =============================================
// LIKE  (POST /like)
// body: { postId, email, Userrole }
// Safe to call twice: a second call does not add another like.
// =============================================

export const likePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.body ?? {};

    if (!isValidId(postId)) {
      res.status(400).json({ message: "Valid postId is required" });
      return;
    }

    const user = await resolveUser(req, res);
    if (!user) return;

    await Post.updateOne(
      { _id: postId, likedBy: { $ne: user._id } },
      { $addToSet: { likedBy: user._id }, $inc: { likes: 1 } }
    );

    const post = await Post.findById(postId).select("likes");

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json({
      success: true,
      liked: true,
      likes: post.likes,
    });
  } catch (error) {
    console.error("Like post error:", error);

    res.status(500).json({
      message: "Internal server error while liking post",
    });
  }
};

// =============================================
// UNLIKE  (DELETE /like)
// body: { postId, email, Userrole }
// Safe to call twice: a second call does not reduce the count again.
// =============================================

export const unlikePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.body ?? {};

    if (!isValidId(postId)) {
      res.status(400).json({ message: "Valid postId is required" });
      return;
    }

    const user = await resolveUser(req, res);
    if (!user) return;

    await Post.updateOne(
      { _id: postId, likedBy: user._id },
      { $pull: { likedBy: user._id }, $inc: { likes: -1 } }
    );

    const post = await Post.findById(postId).select("likes");

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json({
      success: true,
      liked: false,
      likes: Math.max(post.likes, 0),
    });
  } catch (error) {
    console.error("Unlike post error:", error);

    res.status(500).json({
      message: "Internal server error while unliking post",
    });
  }
};

// =============================================
// ADD COMMENT  (POST /comments)
// body: { postId, email, Userrole, text }
// =============================================

export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.body ?? {};

    if (!isValidId(postId)) {
      res.status(400).json({ message: "Valid postId is required" });
      return;
    }

    const text =
      typeof req.body?.text === "string" ? req.body.text.trim() : "";

    if (!text) {
      res.status(400).json({ message: "Comment text is required" });
      return;
    }

    if (text.length > MAX_COMMENT_LENGTH) {
      res.status(400).json({
        message: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer`,
      });
      return;
    }

    const user = await resolveUser(req, res);
    if (!user) return;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            user: user._id,
            text,
          },
        },
      },
      { new: true, runValidators: true }
    ).populate("comments.user", USER_FIELDS);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Newly added comment is the last item
    const comment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added",
      comment,
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Internal server error while adding comment",
    });
  }
};

// =============================================
// GET COMMENTS  (POST /comments/list)
// body: { postId }
// (POST is used because a GET request should not carry a body)
// =============================================

export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.body ?? {};

    if (!isValidId(postId)) {
      res.status(400).json({ message: "Valid postId is required" });
      return;
    }

    const post = await Post.findById(postId)
      .select("comments")
      .populate("comments.user", USER_FIELDS);

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    // Newest first
    const comments = [...post.comments].reverse();

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Internal server error while fetching comments",
    });
  }
};

// =============================================
// DELETE COMMENT  (DELETE /comments)
// body: { postId, commentId, email, Userrole }
// =============================================

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId, commentId } = req.body ?? {};

    if (!isValidId(postId) || !isValidId(commentId)) {
      res.status(400).json({
        message: "Valid postId and commentId are required",
      });
      return;
    }

    const user = await resolveUser(req, res);
    if (!user) return;

    const post = await Post.findById(postId).select("comments");

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    const comment = post.comments.find(
      (c) => String((c as any)._id) === commentId
    );

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    const isOwner = String(comment.user) === String(user._id);
    const isModerator = MODERATOR_ROLES.includes(String(user.role));

    if (!isOwner && !isModerator) {
      res.status(403).json({
        message: "You can only delete your own comments",
      });
      return;
    }

    const updated = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    ).select("comments");

    res.status(200).json({
      success: true,
      message: "Comment deleted",
      commentCount: updated?.comments.length ?? 0,
    });
  } catch (error) {
    console.error("Delete comment error:", error);

    res.status(500).json({
      message: "Internal server error while deleting comment",
    });
  }
};