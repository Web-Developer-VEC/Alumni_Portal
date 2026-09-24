import mongoose, { type Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  profilePic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;

