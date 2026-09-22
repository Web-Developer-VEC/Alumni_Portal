import { Router } from "express";
import passport from "../../config/passport.js";
import { sendOTP, register } from "../../controllers/auth/auth.controller.js";

import {
  googleLogin,
  getCurrentUser,
  logout,
} from "../../controllers/auth/passport.controller.js";

const router = Router();

// Start Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login",
  }),
  googleLogin
);


// Logout
router.get("/logout", logout);
router.post("/send-otp", sendOTP);
router.post("/register", register);

export default router;