import mongoose, { type Document } from "mongoose";

export interface IUser {
  name?: string;
  displayName?: string;
  email: string;
  password: string;
  role: "ADMIN" | "STUDENT" | "ALUMNI";
  isActive: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectReason?: string;
  username?: string;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String },
    displayName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN','STUDENT','ALUMNI'], default: 'STUDENT' },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['PENDING','APPROVED','REJECTED'], default: 'PENDING' },
    rejectReason: { type: String },
    username: { type: String },
    profilePic: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;

