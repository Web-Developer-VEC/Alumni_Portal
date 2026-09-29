import type { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../../models/User.js";
import alumniprofile from "../../models/alumniprofile.js";

/**
 * Fetch all pending alumni registrations for HOD approval.
 * Supports optional status query (?status=PENDING | APPROVED | REJECTED | ALL).
 * Defaults to PENDING.
 */
export const getPendingAlumni = async (req: Request, res: Response): Promise<void> => {
  try {
    const statusQuery = ((req.query.status as string) || "PENDING").toUpperCase();

    const userFilter: any = { role: "ALUMNI" };
    if (statusQuery !== "ALL") {
      userFilter.status = statusQuery;
    }

    const users = await User.find(userFilter).sort({ createdAt: -1 }).lean();
    const emails = users.map((u) => u.email).filter(Boolean);

    // Fetch corresponding profile records
    const profiles = await alumniprofile.find({ email: { $in: emails } }).lean();
    const profileMap = new Map<string, any>();
    profiles.forEach((p) => {
      if (p.email) {
        profileMap.set(p.email.toLowerCase().trim(), p);
      }
    });

    // Merge User and AlumniProfile data
    const data: any[] = users.map((user) => {
      const profile = profileMap.get(user.email.toLowerCase().trim()) || {};

      return {
        id: user._id.toString(),
        _id: user._id.toString(),
        userId: user._id.toString(),
        email: user.email,
        status: user.status,
        rejectReason: user.rejectReason,
        createdAt: user.createdAt,

        // Personal Details
        fullName: profile.fullName || user.displayName || user.name || user.email.split("@")[0],
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        profilePhoto: profile.profilePic || user.profilePic || "",
        mobileNumber: profile.mobileNumber || "",

        // Academic Details
        registerNumber: profile.registerNumber || "",
        programme: profile.programme || "",
        department: profile.department || "",
        batch: profile.batch || "",

        // Professional Details
        currentStatus: profile.designation ? "Employed" : profile.company ? "Employed" : "Alumni",
        company: profile.company || "",
        jobTitle: profile.designation || "",
        industry: profile.industry || "",
        workLocation: profile.workLocation || "",
        officialEmail: profile.officialEmail || "",
        linkedInUrl: profile.linkedInUrl || "",

        // Alumni Contributions
        contributions: (profile as any).contributions || {
          attendAlumniEvents: false,
          mentorStudents: false,
          internshipOpportunities: false,
          jobOpportunities: false,
          guestLectures: false,
          supportCollegeActivities: false,
          donations: false,
        },

        // Address
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        country: profile.country || "",
        pincode: profile.pincode || "",
      };
    });

    // Handle any standalone alumniprofiles not matched to a User (if any exist)
    const userEmails = new Set(users.map((u) => u.email.toLowerCase().trim()));
    if (statusQuery === "PENDING" || statusQuery === "ALL") {
      const orphanProfiles = await alumniprofile
        .find({
          email: { $nin: Array.from(userEmails) },
        })
        .lean();

      orphanProfiles.forEach((profile) => {
        data.push({
          id: profile._id.toString(),
          _id: profile._id.toString(),
          userId: profile._id.toString(),
          email: profile.email || "",
          status: "PENDING",
          rejectReason: undefined,
          createdAt: profile.createdAt || new Date(),

          fullName: profile.fullName || "Alumni Member",
          dateOfBirth: profile.dateOfBirth || "",
          gender: profile.gender || "",
          profilePhoto: profile.profilePic || "",
          mobileNumber: profile.mobileNumber || "",

          registerNumber: profile.registerNumber || "",
          programme: profile.programme || "",
          department: profile.department || "",
          batch: profile.batch || "",

          currentStatus: profile.designation ? "Employed" : profile.company ? "Employed" : "Alumni",
          company: profile.company || "",
          jobTitle: profile.designation || "",
          industry: profile.industry || "",
          workLocation: profile.workLocation || "",
          officialEmail: profile.officialEmail || "",
          linkedInUrl: profile.linkedInUrl || "",

          contributions: (profile as any).contributions || {
            attendAlumniEvents: false,
            mentorStudents: false,
            internshipOpportunities: false,
            jobOpportunities: false,
            guestLectures: false,
            supportCollegeActivities: false,
            donations: false,
          },

          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          country: profile.country || "",
          pincode: profile.pincode || "",
        });
      });
    }

    res.status(200).json({
      success: true,
      message: "Pending alumni fetched successfully",
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("getPendingAlumni error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending alumni",
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
};

/**
 * Fetch a single pending alumni by user id or profile id.
 */
export const getPendingUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id || (req.query.id as string);
    if (!id) {
      res.status(400).json({ success: false, message: "ID is required" });
      return;
    }

    let user: any = null;
    let profile: any = null;

    if (mongoose.isValidObjectId(id)) {
      user = await User.findById(id).lean();
      if (!user) {
        profile = await alumniprofile.findById(id).lean();
        if (profile?.email) {
          user = await User.findOne({ email: profile.email }).lean();
        }
      }
    }

    if (!user && !profile) {
      res.status(404).json({ success: false, message: "Alumni record not found" });
      return;
    }

    if (user && !profile && user.email) {
      profile = await alumniprofile.findOne({ email: user.email }).lean();
    }

    const merged = {
      id: user ? user._id.toString() : profile._id.toString(),
      _id: user ? user._id.toString() : profile._id.toString(),
      email: user?.email || profile?.email || "",
      status: user?.status || "PENDING",
      rejectReason: user?.rejectReason,
      createdAt: user?.createdAt || profile?.createdAt,

      fullName: profile?.fullName || user?.displayName || user?.name || "Alumni Member",
      dateOfBirth: profile?.dateOfBirth || "",
      gender: profile?.gender || "",
      profilePhoto: profile?.profilePic || user?.profilePic || "",
      mobileNumber: profile?.mobileNumber || "",

      registerNumber: profile?.registerNumber || "",
      programme: profile?.programme || "",
      department: profile?.department || "",
      batch: profile?.batch || "",

      currentStatus: profile?.designation ? "Employed" : profile?.company ? "Employed" : "Alumni",
      company: profile?.company || "",
      jobTitle: profile?.designation || "",
      industry: profile?.industry || "",
      workLocation: profile?.workLocation || "",
      officialEmail: profile?.officialEmail || "",
      linkedInUrl: profile?.linkedInUrl || "",

      contributions: profile?.contributions || {
        attendAlumniEvents: false,
        mentorStudents: false,
        internshipOpportunities: false,
        jobOpportunities: false,
        guestLectures: false,
        supportCollegeActivities: false,
        donations: false,
      },

      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      country: profile?.country || "",
      pincode: profile?.pincode || "",
    };

    res.status(200).json({
      success: true,
      message: "Alumni details fetched successfully",
      data: merged,
    });
  } catch (error) {
    console.error("getPendingUserById error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching alumni details",
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
};

/**
 * Approve a user's profile after HOD review.
 * Expected request params: { id: string } (user id, profile id, or in body)
 */
export const approveUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id || req.body.id || req.body.userId;
    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }

    let updatedUser = null;

    if (mongoose.isValidObjectId(userId)) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: "APPROVED", rejectReason: undefined },
        { new: true }
      );
    }

    // Fallback 1: Check if userId is an alumniprofile ID
    if (!updatedUser && mongoose.isValidObjectId(userId)) {
      const profile = await alumniprofile.findById(userId);
      if (profile?.email) {
        updatedUser = await User.findOneAndUpdate(
          { email: profile.email.toLowerCase().trim() },
          { status: "APPROVED", rejectReason: undefined },
          { new: true }
        );
      }
    }

    // Fallback 2: Check by email directly
    if (!updatedUser && typeof userId === "string" && userId.includes("@")) {
      updatedUser = await User.findOneAndUpdate(
        { email: userId.toLowerCase().trim() },
        { status: "APPROVED", rejectReason: undefined },
        { new: true }
      );
    }

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, message: "User approved successfully", data: updatedUser });
  } catch (error) {
    console.error("approveUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving user",
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
};

/**
 * Reject a user's profile after HOD review.
 * Expected request params: { id: string } and body { reason: string }
 */
export const rejectUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id || req.body.id || req.body.userId;
    const reason = req.body.reason?.trim();

    if (!userId) {
      res.status(400).json({ success: false, message: "User ID is required" });
      return;
    }
    if (!reason) {
      res.status(400).json({ success: false, message: "Rejection reason is required" });
      return;
    }

    let updatedUser = null;

    if (mongoose.isValidObjectId(userId)) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { status: "REJECTED", rejectReason: reason },
        { new: true }
      );
    }

    // Fallback 1: Check if userId is an alumniprofile ID
    if (!updatedUser && mongoose.isValidObjectId(userId)) {
      const profile = await alumniprofile.findById(userId);
      if (profile?.email) {
        updatedUser = await User.findOneAndUpdate(
          { email: profile.email.toLowerCase().trim() },
          { status: "REJECTED", rejectReason: reason },
          { new: true }
        );
      }
    }

    // Fallback 2: Check by email directly
    if (!updatedUser && typeof userId === "string" && userId.includes("@")) {
      updatedUser = await User.findOneAndUpdate(
        { email: userId.toLowerCase().trim() },
        { status: "REJECTED", rejectReason: reason },
        { new: true }
      );
    }

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.status(200).json({ success: true, message: "User rejected successfully", data: updatedUser });
  } catch (error) {
    console.error("rejectUser error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting user",
      error: error instanceof Error ? error.message : "Unknown",
    });
  }
};

// Aliases for flexible imports
export const getPendingUsers = getPendingAlumni;
export default {
  getPendingAlumni,
  getPendingUsers,
  getPendingUserById,
  approveUser,
  rejectUser,
};
