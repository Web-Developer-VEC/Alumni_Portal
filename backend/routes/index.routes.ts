import express from "express";
const router = express.Router();
import uploadRoutes from "./uploadRoutes.js";
import authRoutes from "./auth/auth.route.js";

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);

export default router;
