import express from "express";
import * as hodController from "../controllers/hodController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/hod/faculty-list", requireAuth("hod", "admin"), hodController.getHodFacultyList);
router.get("/hod/questions/:username", requireAuth("hod", "admin"), hodController.getHodQuestionsForFaculty);
router.post("/hod/evaluation", requireAuth("hod", "admin"), hodController.saveHodEvaluation);
router.get("/hod/evaluation/:username", requireAuth(), hodController.getHodEvaluation);

router.post("/department-appraisal/draft", requireAuth("hod", "admin"), hodController.saveDepartmentAppraisalDraft);
router.post("/department-appraisal/submit", requireAuth("hod", "admin"), hodController.submitDepartmentAppraisal);
router.get("/department-appraisal/reports/summary", hodController.getDepartmentAppraisalReport);
router.get("/department-appraisal/:department", hodController.getDepartmentAppraisal);

export default router;
