import { Router } from "express";
import * as alumni from "../../controllers/mentorship/Mentorship.controller.js";
import * as hod from "../../controllers/mentorship/Mentorshiphod.controller.js";

const router = Router();

/* Alumni */
router.post("/applications", alumni.submitApplication);
router.get("/applications/mine", alumni.getMyApplications);

/* HOD */
router.get("/hod/applications", hod.getApplications);
router.get("/hod/applications/:id", hod.getApplicationById);
router.patch("/hod/applications/:id/approve", hod.approveApplication);
router.patch("/hod/applications/:id/reject", hod.rejectApplication);
router.delete("/hod/applications/:id", hod.deleteApplication);

export default router;

