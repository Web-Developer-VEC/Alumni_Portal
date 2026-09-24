import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import Otp from "../../service/Otp.js";
import { sendEmail } from "../../service/sendEmail.js";
import { getOtpEmailTemplate } from "../../utils/emailTemplates.js";

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Remove any existing OTP for this email
    await Otp.deleteMany({ email });

    // Save new OTP
    const newOtp = new Otp({ email, otp: otpCode });
    await newOtp.save();

    // Send Email
    const emailHtml = getOtpEmailTemplate(otpCode);
    const emailSent = await sendEmail(
      email,
      "Alumni Portal Registration OTP",
      emailHtml
    );

    if (emailSent) {
      res.status(200).json({ message: "OTP sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send OTP email" });
    }
  } catch (error) {
    console.error("sendOTP Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ message: "Email and OTP are required" });
      return;
    }

    // Verify OTP
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Check again if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists with this email" });
      return;
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("register (verifyOTP) Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, password } = req.body;

    if (!email ||!password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Verify OTP again for security before setting password
    

  

    
    

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = new User({
      email,
      password: hashedPassword,
    });
    await newUser.save();

    // Delete OTP after successful registration
    await Otp.deleteMany({ email });

    res.status(201).json({ message: "Password set and user registered successfully" });
  } catch (error) {
    console.error("setPassword Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


