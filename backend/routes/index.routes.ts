import express from "express";
const router = express.Router();
import uploadRoutes from "./uploadRoutes.js";
import authRoutes from "./auth/auth.route.js";
import alumniroute from "./alumni/alumni.routes.js"
import postRoutes from "./posts/post.routes.js";
import galleryRoutes from "./gallery/gallery.routes.js";
import eventRoutes from "./event/event.route.js";

router.use("/event", eventRoutes);
router.use("/posts", postRoutes);
router.use("/auth", authRoutes);
router.use("/upload", uploadRoutes);
router.use("/alumni",alumniroute)
router.use("/gallery", galleryRoutes);


export default router;
