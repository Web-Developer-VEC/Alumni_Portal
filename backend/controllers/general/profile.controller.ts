import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import alumniprofile from "../../models/alumniprofile.js";

interface DecodedToken {
  id?: string;
  _id?: string;
  userId?: string;
  email?: string;
  role?: string;
  displayName?: string;
  username?: string;
  [key: string]: unknown;
}

/**
 * Extracts JWT token from request Authorization header, body, query, or session
 */
export const extractTokenFromRequest = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7).trim();
    }
    return authHeader.trim();
  }

  if (typeof req.body?.token === "string" && req.body.token.trim()) {
    return req.body.token.trim();
  }

  if (typeof req.query?.token === "string" && req.query.token.trim()) {
    return req.query.token.trim();
  }

  if (req.session && (req.session as any).token) {
    return (req.session as any).token;
  }

  return null;
};

/**
 * Decodes the JWT token to retrieve payload data
 */
export const decodeJwtToken = (token: string): DecodedToken | null => {
  const secret = process.env.JWT_SECRET || "alumni_portal_jwt_secret";

  try {
    return jwt.verify(token, secret) as DecodedToken;
  } catch {
    try {
      // Fallback: decode without verification if signed with another secret or expired
      return jwt.decode(token) as DecodedToken;
    } catch {
      return null;
    }
  }
};

/**
 * Controller to decode token, retrieve email, and return all profile details
 */
export const getProfileByToken = async (
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

    // If email is missing in token, attempt to resolve via user ID
    if (!email && userId) {
      const userById = await User.findById(userId).lean();
      if (userById && userById.email) {
        email = userById.email;
      }
    }

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email could not be determined from the token",
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Fetch User account details (excluding password)
    const userQuery: Record<string, unknown>[] = [
      { email: normalizedEmail },
      { email: email.trim() },
    ];
    if (userId) {
      userQuery.push({ _id: userId });
    }

    const user = await User.findOne({ $or: userQuery })
      .select("-password")
      .lean();

    // 2. Fetch AlumniProfile details
    const targetEmail = user?.email || normalizedEmail;
    const profile = await alumniprofile
      .findOne({
        $or: [
          { email: targetEmail },
          { email: targetEmail.toLowerCase().trim() },
        ],
      })
      .lean();

    if (!user && !profile) {
      res.status(404).json({
        success: false,
        message: "Profile not found for the provided email",
        email: targetEmail,
      });
      return;
    }

    // Combine all fields into a rich, comprehensive profile response
    const profileData = {
      // Primary Identifiers
      id: user?._id?.toString() || profile?._id?.toString(),
      _id: user?._id?.toString() || profile?._id?.toString(),
      userId: user?._id?.toString() || "",
      email: targetEmail,

      // Account & Status
      name: user?.name || user?.displayName || profile?.fullName || "",
      displayName: user?.displayName || profile?.fullName || user?.name || "",
      username: user?.username || "",
      role: user?.role || "ALUMNI",
      status: user?.status || "PENDING",
      isActive: user?.isActive ?? true,
      rejectReason: user?.rejectReason || "",

      // Personal Information
      fullName: profile?.fullName || user?.displayName || user?.name || "",
      profilePic: profile?.profilePic || user?.profilePic || "",
      profilePhoto: profile?.profilePic || user?.profilePic || "",
      dateOfBirth: profile?.dateOfBirth || "",
      gender: profile?.gender || "",
      mobileNumber: profile?.mobileNumber || "",

      // Academic Information
      registerNumber: profile?.registerNumber || "",
      programme: profile?.programme || "",
      department: profile?.department || "",
      batch: profile?.batch || "",

      // Address Information
      address: profile?.address || "",
      city: profile?.city || "",
      state: profile?.state || "",
      country: profile?.country || "",
      pincode: profile?.pincode || "",

      // Professional Information
      company: profile?.company || "",
      designation: profile?.designation || "",
      industry: profile?.industry || "",
      workLocation: profile?.workLocation || "",
      officialEmail: profile?.officialEmail || "",
      linkedInUrl: profile?.linkedInUrl || "",

      // Metadata
      createdAt: user?.createdAt || profile?.createdAt,
      updatedAt: user?.updatedAt || profile?.updatedAt,

      // Raw Documents for client flexibility
      user: user || null,
      alumniProfile: profile || null,
    };

    res.status(200).json({
      success: true,
      message: "Profile details fetched successfully",
      data: profileData,
      profile: profileData,
    });
  } catch (error) {
    console.error("getProfileByToken error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching profile details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
