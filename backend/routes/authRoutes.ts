import express from "express";
import { sendOTP, register, setPassword } from "../controllers/auth/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/register", register);
router.post("/set-password", setPassword);


export default router;
