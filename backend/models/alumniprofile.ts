import mongoose from "mongoose";

const alumniSchema = new mongoose.Schema(
  {

    // Section 1: Basic Info
    email: { type: String },
    fullName: { type: String },
    dateOfBirth: { type: String },
    gender: { type: String },

    mobileNumber: { type: String },
    // Section 2: Academic Info
    registerNumber: { type: String },
    programme: { type: String },
    department: { type: String },
    batch: { type: String },
    // Section 3: Address Info
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
    // Section 4: Professional/Current Status Info
    
    company: { type: String },
    designation: { type: String },
    industry: { type: String },
    workLocation: { type: String },
    officialEmail: { type: String },
    linkedInUrl: { type: String },
  },
  { timestamps: true }
);


const alumniprofile = mongoose.model("alumniprofile", alumniSchema);

export default alumniprofile ;
