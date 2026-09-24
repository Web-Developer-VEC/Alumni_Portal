import type { Request, Response } from "express";
import path from "path";
import alumniprofile from "../../models/alumniprofile.js";
import User from "../../models/User.js";
import { uploadFileToS3 } from "../../service/s3Upload.js";
import crypto from "crypto"; 

export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      email,
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      registerNumber,
      programme,
      department,
      batch,
      address,
      city,
      state,
      country,
      pincode,
      company,
      designation,
      industry,
      workLocation,
      officialEmail,
      linkedInUrl,
      profilePic,
      profilePicture,
    } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required to complete profile" });
      return;
    }

    if (!fullName || !mobileNumber) {
      res.status(400).json({ message: "Full Name and Mobile Number are required." });
      return;
    }

    // STEP 1: Check if the email exists in the users collection
    const baseUser = await User.findOne({ email });
    if (!baseUser) {
      res.status(404).json({ message: "User account not found. Please register first." });
      return; 
    }

    // STEP 2: Go to alumniprofile to find existing or create a new one
    let profile = await alumniprofile.findOne({ email });

    if (!profile) {
      profile = new alumniprofile({ email });
    }

    // STEP 3: Handle profile picture upload if file is attached
    if (req.file) {
      const fileExt = path.extname(req.file.originalname) || ".jpg";
      
      // Standardize the email before hashing for consistency
      const safeEmail = email.toLowerCase().trim();
      // Produces 16 characters (e.g., "8b1a9953c4611296")
const hashedEmail = crypto.createHash("sha256").update(safeEmail).digest("hex").slice(0, 16);
      
      // Use hashedEmail as the file name
      const uniqueFileName = `profile/${hashedEmail}${fileExt}`;

      const uploadedUrl = await uploadFileToS3(
        req.file.buffer,
        uniqueFileName,
        req.file.mimetype
      );
      profile.profilePic = uploadedUrl;
    } else if (profilePic || profilePicture) {
      // If client supplied an already uploaded image URL string
      profile.profilePic = profilePic || profilePicture;
    }

    // STEP 4: Add all the data to the profile object
    profile.fullName = fullName;
    profile.dateOfBirth = dateOfBirth;
    profile.gender = gender;
    profile.mobileNumber = mobileNumber;

    profile.registerNumber = registerNumber;
    profile.programme = programme;
    profile.department = department;
    profile.batch = batch;

    profile.address = address;
    profile.city = city;
    profile.state = state;
    profile.country = country;
    profile.pincode = pincode;

    profile.company = company;
    profile.designation = designation;
    profile.industry = industry;
    profile.workLocation = workLocation;
    profile.officialEmail = officialEmail;
    profile.linkedInUrl = linkedInUrl;

    // STEP 5: Save the profile to the database
    await profile.save();

    // STEP 6: Optionally keep User profilePic in sync
    if (profile.profilePic) {
      baseUser.profilePic = profile.profilePic;
      await baseUser.save();
    }

    res.status(200).json({ message: "Profile completed successfully", profile });
  } catch (error) {
    console.error("completeProfile Error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};