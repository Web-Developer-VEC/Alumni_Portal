// HOD side: list / view / approve / reject / delete applications for the HOD's own department.
// The HOD is identified by `email` (body for PATCH, query string for GET/DELETE).
import type { Request, Response } from "express";
import mongoose from "mongoose";
import MentorApplication from "../../models/MentorApplication.js";
import { resolveHod, escapeRegex, PROFILE_FIELDS } from "../../utils/mentorshipUtils.js";

const STATUSES = ["PENDING", "APPROVED", "REJECTED"];

const fail = (res: Response, label: string, error: unknown) => {
  console.error(`${label} error:`, error);
  res.status(500).json({ success: false, message: `Server error while ${label}` });
};

function getId(req: Request, res: Response): string | null {
  const id = String(req.params.id ?? "");
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).json({ success: false, message: "A valid application ID is required" });
    return null;
  }
  return id;
}

// GET /api/mentorship/hod/applications?email=&status=PENDING&search=finance&page=1&limit=10   (default PENDING)
export const getApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const hod = await resolveHod(req, res);
    if (!hod) return;

    const page = Math.max(parseInt(String(req.query.page), 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit), 10) || 10, 1), 50);

    const status = String(req.query.status ?? "PENDING").toUpperCase();
    const filter: Record<string, unknown> = {
      department: hod.department,
      status: STATUSES.includes(status) ? status : "PENDING",
    };

    if (req.query.search) {
      const rx = new RegExp(escapeRegex(String(req.query.search).trim()), "i");
      filter.$or = [{ keywords: rx }, { why: rx }, { fields: rx }];
    }

    const [applications, total] = await Promise.all([
      MentorApplication.find(filter)
        .populate("profile", PROFILE_FIELDS)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      MentorApplication.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: applications.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      applications,
    });
  } catch (error) {
    fail(res, "fetching applications", error);
  }
};

// GET /api/mentorship/hod/applications/:id?email=
export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req, res);
    if (!id) return;
    const hod = await resolveHod(req, res);
    if (!hod) return;

    const application = await MentorApplication.findOne({ _id: id, department: hod.department })
      .populate("profile", PROFILE_FIELDS)
      .lean();

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }
    res.status(200).json({ success: true, application });
  } catch (error) {
    fail(res, "fetching the application", error);
  }
};

// PATCH /api/mentorship/hod/applications/:id/approve     body: { email }
export const approveApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req, res);
    if (!id) return;
    const hod = await resolveHod(req, res);
    if (!hod) return;

    // Atomic: only a PENDING application in this HOD's department can be approved
    const application = await MentorApplication.findOneAndUpdate(
      { _id: id, department: hod.department, status: "PENDING" },
      { status: "APPROVED", reviewedBy: hod.id, reviewedAt: new Date(), $unset: { rejectReason: "" } },
      { new: true },
    ).populate("profile", PROFILE_FIELDS);

    if (!application) {
      res.status(404).json({ success: false, message: "Pending application not found in your department" });
      return;
    }
    res.status(200).json({ success: true, message: "Application approved", application });
  } catch (error) {
    fail(res, "approving the application", error);
  }
};

// PATCH /api/mentorship/hod/applications/:id/reject     body: { email, reason? }
export const rejectApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req, res);
    if (!id) return;
    const hod = await resolveHod(req, res);
    if (!hod) return;

    const reason = String(req.body?.reason ?? "").trim();
    if (reason.length > 500) {
      res.status(400).json({ success: false, message: "Reason must be under 500 characters." });
      return;
    }

    const application = await MentorApplication.findOneAndUpdate(
      { _id: id, department: hod.department, status: "PENDING" },
      { status: "REJECTED", reviewedBy: hod.id, reviewedAt: new Date(), ...(reason && { rejectReason: reason }) },
      { new: true },
    ).populate("profile", PROFILE_FIELDS);

    if (!application) {
      res.status(404).json({ success: false, message: "Pending application not found in your department" });
      return;
    }
    res.status(200).json({ success: true, message: "Application rejected", application });
  } catch (error) {
    fail(res, "rejecting the application", error);
  }
};

// DELETE /api/mentorship/hod/applications/:id?email=   (any status, own department only)
export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getId(req, res);
    if (!id) return;
    const hod = await resolveHod(req, res);
    if (!hod) return;

    const deleted = await MentorApplication.findOneAndDelete({ _id: id, department: hod.department });
    if (!deleted) {
      res.status(404).json({ success: false, message: "Application not found in your department" });
      return;
    }
    res.status(200).json({ success: true, message: "Application deleted" });
  } catch (error) {
    fail(res, "deleting the application", error);
  }
};