import mongoose, { type Document } from "mongoose";

export interface IUser extends Document {
  displayName?: string;
  email: string;
  password: string;
  role: "ADMIN" | "STUDENT" | "ALUMNI";
  isActive: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  username?: string;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;

