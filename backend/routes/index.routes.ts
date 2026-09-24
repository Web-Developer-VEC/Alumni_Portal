import express from "express";
const router = express.Router();
import uploadRoutes from "./uploadRoutes.js";
import authRoutes from "./auth/auth.route.js";
import alumniroute from "./alumni/alumni.routes.js"

router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/alumni",alumniroute)

export default router;
