import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import Otp from "../../service/Otp.js";
import { sendEmail } from "../../service/sendEmail.js";
import { getOtpEmailTemplate } from "../../utils/emailTemplates.js";
import jwt from "jsonwebtoken";

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

    const formattedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: formattedEmail }, { email: email.trim() }],
    });

    if (existingUser) {
      if (existingUser.status === "APPROVED") {
        res.status(400).json({ message: "Email already exists" });
        return;
      }
      if (existingUser.status === "REJECTED") {
        res.status(400).json({ message: "Your registration has been rejected." });
        return;
      }
      // If user is in PENDING status, allow user to send OTP
    }

    // Generate OTP
    const otpCode = generateOTP();

    // Remove any existing OTP for this email
    await Otp.deleteMany({
      $or: [{ email: formattedEmail }, { email: email.trim() }],
    });

    // Save new OTP
    const newOtp = new Otp({ email: formattedEmail, otp: otpCode });
    await newOtp.save();

    // Send Email
    const emailHtml = getOtpEmailTemplate(otpCode);
    const emailSent = await sendEmail(
      formattedEmail,
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

    const formattedEmail = email.toLowerCase().trim();

    // Verify OTP
    const otpRecord = await Otp.findOne({
      $or: [{ email: formattedEmail }, { email: email.trim() }],
      otp,
    });

    if (!otpRecord) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    // Check again if user exists
    const existingUser = await User.findOne({
      $or: [{ email: formattedEmail }, { email: email.trim() }],
    });

    if (existingUser) {
      if (existingUser.status === "APPROVED") {
        res.status(400).json({ message: "Email already exists" });
        return;
      }
      if (existingUser.status === "REJECTED") {
        res.status(400).json({ message: "Your registration has been rejected." });
        return;
      }
      // If user is in PENDING status, allow verification to proceed
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("register (verifyOTP) Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const setPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const formattedEmail = email.toLowerCase().trim();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: formattedEmail }, { email: email.trim() }],
    });

    if (existingUser) {
      if (existingUser.status === "APPROVED") {
        res.status(400).json({ message: "Email already exists" });
        return;
      }
      if (existingUser.status === "REJECTED") {
        res.status(400).json({ message: "Your registration has been rejected." });
        return;
      }

      // If user is in PENDING status, update password
      existingUser.password = hashedPassword;
      await existingUser.save();
    } else {
      // Create User
      const newUser = new User({
        email: formattedEmail,
        password: hashedPassword,
        role: "ALUMNI",
        status: "PENDING",
      });
      await newUser.save();
    }

    // Delete OTP after successful registration
    await Otp.deleteMany({
      $or: [{ email: formattedEmail }, { email: email.trim() }],
    });

    res.status(201).json({ message: "Password set and user registered successfully" });
  } catch (error) {
    console.error("setPassword Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { usernameOrEmail, password } = req.body;

    // Validate input
    if (!usernameOrEmail || !password) {
      res.status(400).json({
        success: false,
        message: "Username/email and password are required.",
      });
      return;
    }

    // Find user by username OR email
    const user = await User.findOne({
      $or: [
        {
          username: usernameOrEmail.toLowerCase(),
        },
        {
          email: usernameOrEmail.toLowerCase(),
        },
      ],
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
      return;
    }

    // Check account
    if (user.isActive === false) {
      res.status(403).json({
        success: false,
        message:
          "Your account has been disabled. Please contact the administrator.",
      });
      return;
    }

    // Check alumni approval
    if (
      user.role === "ALUMNI" &&
      user.status === "PENDING"
    ) {
      res.status(403).json({
        success: false,
        message:
          "Your alumni registration is still pending approval.",
      });
      return;
    }

    if (
      user.role === "ALUMNI" &&
      user.status === "REJECTED"
    ) {
      res.status(403).json({
        success: false,
        message:
          "Your alumni registration has been rejected.",
      });
      return;
    }

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
      return;
    }

    // Create JWT
    const payload = {
      id: user._id.toString(),
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "alumni_portal_jwt_secret",
      {
        expiresIn: "7d",
      },
    );

    // Existing session
    req.session.token = token;

    req.session.user = {
      id: payload.id,
      displayName: payload.displayName,
      email: payload.email,
      role: payload.role,
    };

    // Success
    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: payload.id,
        displayName: payload.displayName,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login.",
    });
  }
};
