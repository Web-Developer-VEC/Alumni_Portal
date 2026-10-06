import express from "express";
import { getProfileByToken } from "../../controllers/general/profile.controller.js";
import { getUserPostsByToken } from "../../controllers/general/post.controller.js";

const router = express.Router();

// Profile routes: accepts token from Authorization header or body/query
router.get("/profile", getProfileByToken);
router.post("/profile", getProfileByToken);

// User posts routes: accepts token from Authorization header or body/query
router.get("/posts", getUserPostsByToken);
router.post("/posts", getUserPostsByToken);
router.get("/my-posts", getUserPostsByToken);
router.post("/my-posts", getUserPostsByToken);

export default router;
