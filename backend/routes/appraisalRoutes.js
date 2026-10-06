import express from "express";
import * as appraisalController from "../controllers/appraisalController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Self Appraisal
router.post("/appraisal/draft", requireAuth("faculty"), appraisalController.saveDraft);
router.get("/appraisal/draft", requireAuth("faculty"), appraisalController.getDraft);
router.post("/appraisal/submit", requireAuth("faculty"), appraisalController.submitAppraisal);
router.get("/submissions", requireAuth(), appraisalController.getMySubmissions);
router.get("/appraisal/submissions/:staffId", appraisalController.getAppraisalSubmissions);
router.get("/appraisal/:staffId", appraisalController.getAppraisal);
router.get("/faculty/combined-appraisal/:staffId", appraisalController.getCombinedAppraisal);

// Principal Evaluation
router.get("/principal/faculty-list/:dept", requireAuth("principal", "admin"), appraisalController.getPrincipalFacultyList);
router.post("/principal/evaluation", requireAuth("principal", "admin"), appraisalController.savePrincipalEvaluation);
router.get("/principal/evaluation/:username", requireAuth(), appraisalController.getPrincipalEvaluation);

// Reviewer Evaluation
router.get("/reviewer/faculty-list/:dept", requireAuth("radmin", "admin"), appraisalController.getReviewerFacultyList);
router.post("/reviewer/evaluation", requireAuth("radmin", "admin"), appraisalController.saveReviewerEvaluation);
router.get("/reviewer/evaluation/:username", requireAuth(), appraisalController.getReviewerEvaluation);

// Dean Verification & VAdmin
router.get("/dean/faculty-list/:dept", requireAuth("vadmin", "admin"), appraisalController.getDeanFacultyList);
router.get("/vadmin/appraisals/:username", requireAuth("vadmin", "admin"), appraisalController.getVadminAppraisalDetails);
router.put("/vadmin/appraisals/:username/responses", requireAuth("vadmin", "admin"), appraisalController.saveVadminAppraisalResponses);
router.post("/dean/verify", requireAuth("vadmin", "admin"), appraisalController.saveDeanVerification);
router.get("/dean/verification/:username", requireAuth(), appraisalController.getDeanVerification);

export default router;
