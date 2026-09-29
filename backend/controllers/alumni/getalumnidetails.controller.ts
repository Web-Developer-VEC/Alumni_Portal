import type { Request, Response } from "express";
import mongoose from "mongoose";
import alumniprofile from "../../models/alumniprofile.js";
import User from "../../models/User.js";

/**
 * Controller to fetch all alumni records from the database with optional filtering
 */
export const getAllAlumniDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      department,
      batch,
      company,
      location,
      role,
    } = req.query as Record<string, string | undefined>;

    const filterQuery: Record<string, any> = {};

    if (department && department !== "All") {
      filterQuery.department = { $regex: new RegExp(`^${department.trim()}$`, "i") };
    }

    if (batch && batch !== "All") {
      filterQuery.batch = { $regex: new RegExp(batch.trim(), "i") };
    }

    if (company && company !== "All") {
      filterQuery.company = { $regex: new RegExp(`^${company.trim()}$`, "i") };
    }

    if (location && location !== "All") {
      filterQuery.$or = [
        { workLocation: { $regex: new RegExp(location.trim(), "i") } },
        { city: { $regex: new RegExp(location.trim(), "i") } },
        { state: { $regex: new RegExp(location.trim(), "i") } },
      ];
    }

    if (role && role !== "All") {
      filterQuery.designation = { $regex: new RegExp(role.trim(), "i") };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), "i");
      filterQuery.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { registerNumber: searchRegex },
        { company: searchRegex },
        { designation: searchRegex },
        { department: searchRegex },
      ];
    }

    const alumniList = await alumniprofile.find(filterQuery).sort({ createdAt: -1 }).lean();

    // Correlate with User collection for verification status
    const users = await User.find({ role: "ALUMNI" }).select("email status profilePic").lean();
    const userMap = new Map(
      users.map((u) => [u.email ? u.email.toLowerCase().trim() : "", u])
    );

    const enrichedAlumni = alumniList.map((al: any) => {
      const emailKey = (al.email || "").toLowerCase().trim();
      const matchedUser = userMap.get(emailKey);
      const isApproved = matchedUser ? matchedUser.status === "APPROVED" : true;
      const userPic = matchedUser?.profilePic;

      // Calculate approximate experience from graduation year
      let workExperience = "1-3 Years";
      if (al.batch) {
        const years = al.batch.match(/\d{4}/g);
        if (years && years.length > 0) {
          const passout = parseInt(years[years.length - 1], 10);
          const currentYear = new Date().getFullYear();
          const diff = currentYear - passout;
          if (diff <= 1) workExperience = "0-1 Years";
          else if (diff <= 3) workExperience = "1-3 Years";
          else if (diff <= 5) workExperience = "3-5 Years";
          else if (diff <= 10) workExperience = "5-10 Years";
          else workExperience = "10+ Years";
        }
      }

      // Default skills based on department if not populated
      const defaultSkills: Record<string, string[]> = {
        "Computer Science and Engineering": ["Full Stack", "Data Structures", "Cloud Architecture"],
        "Information Technology": ["React", "Node.js", "AWS", "Python"],
        "AI & Data Science": ["Machine Learning", "Python", "Deep Learning", "SQL"],
        "Electronics and Communication": ["VLSI", "Embedded Systems", "IoT", "MATLAB"],
        "Electrical and Electronics": ["Power Systems", "PLC", "Automation", "Embedded C"],
        "Mechanical Engineering": ["AutoCAD", "SolidWorks", "ANSYS", "Product Design"],
        "Management Studies": ["Product Management", "Marketing", "Strategy", "HR Operations"],
      };

      const deptSkills = defaultSkills[al.department] || ["Engineering", "Problem Solving", "Collaboration"];
      const skills = (Array.isArray(al.skills) && al.skills.length > 0) ? al.skills : deptSkills;

      return {
        ...al,
        id: al._id.toString(),
        name: al.fullName || "Alumni Member",
        profilePhoto: al.profilePic || userPic || "",
        location: al.workLocation || al.city || al.state || "Chennai",
        phone: al.mobileNumber || "",
        linkedIn: al.linkedInUrl || "https://linkedin.com",
        workExperience,
        skills,
        verified: isApproved,
      };
    });

    res.status(200).json({
      success: true,
      message: "Alumni details fetched successfully",
      count: enrichedAlumni.length,
      data: enrichedAlumni,
    });
  } catch (error) {
    console.error("getAllAlumniDetails Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching alumni details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Controller to fetch a single alumni record by MongoDB _id
 */
export const getAlumniById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = (req.params.id || req.query.id || req.body?.id) as string | undefined;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Alumni ID is required (pass via path parameter or ?id= query parameter)",
      });
      return;
    }

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid Alumni ID format",
      });
      return;
    }

    const alumni = await alumniprofile.findById(id);
    if (!alumni) {
      res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Alumni details fetched successfully",
      data: alumni,
    });
  } catch (error) {
    console.error("getAlumniById Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching alumni details",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Aliases for flexible imports
export const getAlumniDetails = getAllAlumniDetails;
export const getAllAlumni = getAllAlumniDetails;

export default getAllAlumniDetails;
