import type { Request, Response } from "express";
import alumniprofile from "../../models/alumniprofile.js";
import User from "../../models/User.js";

export const completeProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      email, 
      fullName, dateOfBirth, gender, mobileNumber,
      registerNumber, programme, department, batch,
      address, city, state, country, pincode,
      company, designation, industry, workLocation, officialEmail, linkedInUrl 
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
      return; // Stops execution if they aren't a registered user
    }

    // STEP 2: Go to alumniprofile to find existing or create a new one
    let profile = await alumniprofile.findOne({ email });
    
    if (!profile) {
      // If it returns null, initialize a fresh profile object tied to this email
      profile = new alumniprofile({ email }); 
    }

    // STEP 3: Add all the data to the profile object
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
    
    // STEP 4: Save the profile to the database
    await profile.save();

    res.status(200).json({ message: "Profile completed successfully", profile });
  } catch (error) {
    console.error("completeProfile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};