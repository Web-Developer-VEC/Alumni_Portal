import type { Request, Response } from "express";
import User from "../../models/User.js";

/**
 * Approve a user's profile after HOD review.
 * Expected request params: { id: string } (user id)
 */
export const approveUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id || req.body.id;
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: "APPROVED", rejectReason: undefined },
      { new: true }
    );
    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, message: "User approved", data: updatedUser });
  } catch (error) {
    console.error("approveUser error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown" });
  }
};

/**
 * Reject a user's profile after HOD review.
 * Expected request params: { id: string } and body { reason: string }
 */
export const rejectUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id || req.body.id;
    const reason = req.body.reason?.trim();
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }
    if (!reason) {
      res.status(400).json({ success: false, message: "Rejection reason is required" });
      return;
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: "REJECTED", rejectReason: reason },
      { new: true }
    );
    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.status(200).json({ success: true, message: "User rejected", data: updatedUser });
  } catch (error) {
    console.error("rejectUser error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error instanceof Error ? error.message : "Unknown" });
  }
};
