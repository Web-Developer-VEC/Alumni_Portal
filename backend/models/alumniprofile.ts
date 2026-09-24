import mongoose, { type Document } from "mongoose";

export interface IAlumniProfile extends Document {
  email?: string;
  fullName?: string;
  profilePic?: string;
  dateOfBirth?: string;
  gender?: string;
  mobileNumber?: string;
  registerNumber?: string;
  programme?: string;
  department?: string;
  batch?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  company?: string;
  designation?: string;
  industry?: string;
  workLocation?: string;
  officialEmail?: string;
  linkedInUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const alumniSchema = new mongoose.Schema(
  {
    // Section 1: Basic Info
    email: { type: String },
    fullName: { type: String },
    profilePic: { type: String },
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

const alumniprofile = mongoose.model<IAlumniProfile>("alumniprofile", alumniSchema);

export default alumniprofile;

