import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IMentorApplication extends Document {
  alumni: Types.ObjectId;        // User _id (from JWT)
  profile: Types.ObjectId;       // alumniprofile _id (mentor details live there)
  department: string;            // copied from alumniprofile; routes the application to the HOD
  keywords: string[];
  why: string;
  fields: string;
  progress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mentorApplicationSchema = new Schema<IMentorApplication>(
  {
    alumni: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    profile: { type: Schema.Types.ObjectId, ref: "alumniprofile", required: true },
    department: { type: String, required: true, index: true },

    keywords: { type: [String], required: true },
    why: { type: String, required: true, trim: true },
    fields: { type: String, required: true, trim: true },
    progress: { type: String, trim: true, default: "" },

    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING", index: true },
    rejectReason: { type: String, trim: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
  },
  { timestamps: true, collection: "mentor_applications" },
);

export default mongoose.model<IMentorApplication>("MentorApplication", mentorApplicationSchema);