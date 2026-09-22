import { Router } from "express";
import authRoute from "./auth/auth.route.js";

const router = Router();

router.use("/auth",authRoute)


export default router;
