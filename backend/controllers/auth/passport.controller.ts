import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

declare module "express-session" {
  interface SessionData {
    token?: string;
    user?: {
      id?: string;
      displayName?: string;
      email?: string;
      photo?: string;
    };
  }
}

export const googleLogin = (req: Request, res: Response): void => {
  try {
    const user = req.user as any;

    if (!user) {
      res.redirect("http://localhost:5173?login=failed");
      return;
    }

    const payload = {
      id: user.id,
      displayName: user.displayName,
      email: user.emails?.[0]?.value,
      photo: user.photos?.[0]?.value,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "alumni_portal_jwt_secret",
      { expiresIn: "7d" }
    );

    // Store JWT and user in session
    if (req.session) {
      req.session.token = token;
      req.session.user = payload;
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}?login=success&token=${token}`);
  } catch (error) {
    console.error("Error in googleLogin:", error);
    res.redirect("http://localhost:5173?login=failed");
  }
};
