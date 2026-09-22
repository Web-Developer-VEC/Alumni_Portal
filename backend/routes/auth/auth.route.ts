import { Router } from "express";
import passport from "../../config/passport.js";
import { sendOTP, register } from "../../controllers/auth/auth.controller.js";
import { googleLogin } from "../../controllers/auth/passport.controller.js";

const router = Router();

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173?login=failed",
  }),
  googleLogin
);

// OTP and registration
router.post("/send-otp", sendOTP);
router.post("/register", register);

export default router;
