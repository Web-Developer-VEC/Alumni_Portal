import { Schema, model, Document, Types } from "mongoose";
import { commentSchema, type IComment } from "./post.js";

export interface IPrePost extends Document {
  title: string;
  content: string;
  link?: string;
  startTime?: Date;
  endTime?: Date;
  fileUrls: string[];
  author: Types.ObjectId;

  company?: string;
  role?: string;
  eligibility?: string;
  location?: string;
  type?: "Full-time" | "Internship" | "Part-time" | "Contract";
  freshers?: boolean;
  remote?: boolean;
  referralAvailable?: boolean;
  highVolumeReferrals?: boolean;
  directReferral?: string;
  package?: string;
  deadline?: Date;
  ppo?: string;
  hiringLoop?: string;
  skills?: string[];
  pledge?: string;
  tags?: string[];
  applyLink?: string;
  applyLabel?: string;

  views: number;
  likes: number;
  comments: IComment[];

  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const prePostSchema = new Schema<IPrePost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    link: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    fileUrls: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    company: { type: String },
    role: { type: String },
    eligibility: { type: String },
    location: { type: String },
    type: {
      type: String,
      enum: ["Full-time", "Internship", "Part-time", "Contract"],
    },
    freshers: { type: Boolean, default: false },
    remote: { type: Boolean, default: false },
    referralAvailable: { type: Boolean, default: false },
    highVolumeReferrals: { type: Boolean, default: false },
    directReferral: { type: String },

    package: { type: String },
    deadline: { type: Date },
    ppo: { type: String },
    hiringLoop: { type: String },
    skills: { type: [String], default: [] },
    pledge: { type: String },
    tags: { type: [String], default: [] },
    applyLink: { type: String },
    applyLabel: { type: String },

    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: [commentSchema], default: [] },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    rejectReason: { type: String },
  },
  {
    timestamps: true,
    collection: "pre_post", // Explicitly map to pre_post collection
  }
);

// Explicit collection name "pre_post"
const PrePost = model<IPrePost>("PrePost", prePostSchema, "pre_post");

export default PrePost;
