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

    // Validation for required fields
    if (!fullName || !mobileNumber) {
      res.status(400).json({ message: "Full Name and Mobile Number are required." });
      return;
    }
    const Users= await User.findOne({email})
    const user = await alumniprofile.findOne({ email });
    if (!Users) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update user profile fields
    user.fullName = fullName;
    user.dateOfBirth = dateOfBirth;
    user.gender = gender;
    
    user.mobileNumber = mobileNumber;
    
    user.registerNumber = registerNumber;
    user.programme = programme;
    user.department = department;
    user.batch = batch;
    
    user.address = address;
    user.city = city;
    user.state = state;
    user.country = country;
    user.pincode = pincode;
    
    
    user.company = company;
    user.designation = designation;
    user.industry = industry;
    user.workLocation = workLocation;
    user.officialEmail = officialEmail;
    user.linkedInUrl = linkedInUrl;
    
    await user.save();

    res.status(200).json({ message: "Profile completed successfully", user });
  } catch (error) {
    console.error("completeProfile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};