import type { Request, Response } from "express";
import User from "../models/User.js";
import alumniprofile from "../models/alumniprofile.js";

// Keep these in sync with the frontend (Mentorship.jsx)
export const MAX_KEYWORDS = 6;
export const MAX_KEYWORD_LEN = 30;
export const MIN_ANSWER_LEN = 20;
export const MAX_ANSWER_LEN = 800;

export const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Your User.role enum is "ADMIN" | "STUDENT" | "ALUMNI", so the HOD logs in as ADMIN.
export const HOD_ROLE = "ADMIN" as const;

/** Email comes from the body (POST/PATCH) or the query string (GET/DELETE). */
export const getEmail = (req: Request): string =>
  String(req.body?.email ?? req.query.email ?? "").trim().toLowerCase();

/** Finds the ALUMNI user for this request, or sends the error and returns null. */
export async function resolveAlumni(req: Request, res: Response) {
  const email = getEmail(req);
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return null;
  }
  const user = await User.findOne({ email, role: "ALUMNI" }).select("_id email");
  if (!user) {
    res.status(404).json({ success: false, message: "Alumni user not found in database" });
    return null;
  }
  return user;
}

/**
 * Finds the HOD user for this request, or sends the error and returns null.
 * ASSUMPTION: the HOD's department is stored on their User document as `department`.
 */
export async function resolveHod(req: Request, res: Response) {
  const email = getEmail(req);
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required" });
    return null;
  }
  const hod = await User.findOne({ email, role: HOD_ROLE }).select("_id department").lean();
  if (!hod) {
    res.status(403).json({ success: false, message: "Only a HOD can access this resource" });
    return null;
  }
  const department = (hod as { department?: string }).department;
  if (!department) {
    res.status(400).json({ success: false, message: "Your account has no department assigned." });
    return null;
  }
  return { id: String(hod._id), department };
}

/** Mentor details come from alumniprofile (matched by email). */
export const findAlumniProfile = (email: string) =>
  alumniprofile.findOne({ email }).select("_id department");

// Profile fields the HOD gets to see for each applicant (no DOB / address)
export const PROFILE_FIELDS =
  "fullName profilePic email mobileNumber officialEmail registerNumber programme department batch " +
  "company designation industry workLocation city state country linkedInUrl";

type Errors = Partial<Record<"keywords" | "why" | "fields" | "progress", string>>;

/** Mirrors the frontend validation. */
export function validateApplication(body: Record<string, unknown> = {}) {
  const errors: Errors = {};

  const seen = new Set<string>();
  const keywords = (Array.isArray(body.keywords) ? body.keywords : [])
    .map((k) => String(k).trim().slice(0, MAX_KEYWORD_LEN))
    .filter((k) => {
      const key = k.toLowerCase();
      if (!k || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  const why = String(body.why ?? "").trim();
  const fields = String(body.fields ?? "").trim();
  const progress = String(body.progress ?? "").trim();

  if (keywords.length === 0) errors.keywords = "Add at least one area you can mentor in.";
  else if (keywords.length > MAX_KEYWORDS) errors.keywords = `You can add up to ${MAX_KEYWORDS} areas.`;

  if (!why) errors.why = "This field is required.";
  else if (why.length < MIN_ANSWER_LEN) errors.why = `Write at least ${MIN_ANSWER_LEN} characters.`;
  else if (why.length > MAX_ANSWER_LEN) errors.why = `Keep this under ${MAX_ANSWER_LEN} characters.`;

  if (!fields) errors.fields = "This field is required.";
  else if (fields.length < MIN_ANSWER_LEN) errors.fields = `Write at least ${MIN_ANSWER_LEN} characters.`;
  else if (fields.length > MAX_ANSWER_LEN) errors.fields = `Keep this under ${MAX_ANSWER_LEN} characters.`;

  if (progress.length > MAX_ANSWER_LEN) errors.progress = `Keep this under ${MAX_ANSWER_LEN} characters.`;

  return { errors, data: { keywords, why, fields, progress } };
}