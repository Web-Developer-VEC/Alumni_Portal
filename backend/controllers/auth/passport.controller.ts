import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";

export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const clientUrl =
    process.env.CLIENT_URL || "http://localhost:5173";

  try {
    const googleUser = req.user as any;

    if (!googleUser) {
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          "Google login failed. User information was not received.",
        )}`,
      );
      return;
    }

    const email = googleUser.emails?.[0]?.value?.toLowerCase();

    if (!email) {
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          "Unable to get your email address from Google.",
        )}`,
      );
      return;
    }

    // Find user in database
    const user = await User.findOne({ email });

    if (!user) {
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          "Your email is not registered in the Alumni Portal.",
        )}`,
      );
      return;
    }

    // Check account
    if (user.isActive === false) {
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          "Your account has been disabled. Please contact the administrator.",
        )}`,
      );
      return;
    }

    // Check alumni approval
    if (
      user.role === "ALUMNI" &&
      user.status === "PENDING"
    ) {
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          "Your alumni registration is still pending approval.",
        )}`,
      );
      return;
    }

    if (
      user.role === "ALUMNI" &&
      user.status === "REJECTED"
    ) {
      res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent(
          "Your alumni registration has been rejected.",
        )}`,
      );
      return;
    }

    // Create JWT
    const payload = {
      id: user._id.toString(),
      displayName: googleUser.displayName,
      email: user.email,
      photo: googleUser.photos?.[0]?.value,
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
      photo: payload.photo,
      role: payload.role,
    };

    // Successful login
    res.redirect(`${clientUrl}/`);
  } catch (error) {
    console.error("Error in googleLogin:", error);

    res.redirect(
      `${clientUrl}/login?error=${encodeURIComponent(
        "An unexpected error occurred during Google login.",
      )}`,
    );
  }
};
