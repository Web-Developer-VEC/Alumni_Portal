import type { Request, Response } from "express";
import alumniprofile from "../../models/alumniprofile.js";

/**
 * Controller to fetch all alumni records from the database
 */
export const getAllAlumniDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const alumniList = await alumniprofile.find();

    res.status(200).json({
      success: true,
      message: "Alumni details fetched successfully",
      count: alumniList.length,
      data: alumniList,
      alumni: alumniList,
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
    const { id } = req.params;

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
      alumni,
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
