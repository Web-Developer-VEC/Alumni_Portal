import {type  Request,type  Response } from "express";

export const googleLogin = (req: Request, res: Response) => {
  res.json({
    message: "Google login successful",
    user: req.user,
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  return res.json({
    user: req.user,
  });
};

export const logout = (req: Request, res: Response) => {
  req.logout((error) => {
    if (error) {
      return res.status(500).json({
        message: "Logout failed",
      });
    }

    req.session.destroy((error) => {
      if (error) {
        return res.status(500).json({
          message: "Session destruction failed",
        });
      }

      res.clearCookie("connect.sid");

      return res.json({
        message: "Logout successful",
      });
    });
  });
};