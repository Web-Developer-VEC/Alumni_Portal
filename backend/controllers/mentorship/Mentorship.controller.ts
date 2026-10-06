
import type { Request, Response } from "express";
import MentorApplication from "../../models/MentorApplication.js";
import { findAlumniProfile, resolveAlumni, validateApplication } from "../../utils/mentorshipUtils.js";

// POST /api/mentorship/applications     body: { email, keywords, why, fields, progress? }
export const submitApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await resolveAlumni(req, res);
    if (!user) return;

    const { errors, data } = validateApplication(req.body);
    if (Object.keys(errors).length) {
      res.status(400).json({ success: false, message: "Validation failed", errors });
      return;
    }

    // Mentor details are taken from the alumni profile, not from the request body
    const profile = await findAlumniProfile(user.email);
    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Please complete your alumni profile before applying as a mentor.",
      });
      return;
    }
    if (!profile.department) {
      res.status(400).json({
        success: false,
        message: "Your profile has no department. Update your profile so the application can reach your HOD.",
      });
      return;
    }

    const application = await MentorApplication.create({
      ...data,
      alumni: user._id,
      profile: profile._id,
      department: profile.department,
      status: "PENDING",
    });

    res.status(201).json({
      success: true,
      message: "Your mentor application has been submitted and is pending HOD approval!",
      application,
    });
  } catch (error) {
    console.error("submitApplication error:", error);
    res.status(500).json({ success: false, message: "Internal server error while submitting application" });
  }
};

// GET /api/mentorship/applications/mine?email=alumni@example.com
export const getMyApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await resolveAlumni(req, res);
    if (!user) return;

    const applications = await MentorApplication.find({ alumni: user._id }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error("getMyApplications error:", error);
    res.status(500).json({ success: false, message: "Internal server error while fetching applications" });
  }
};