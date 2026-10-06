import express from "express";
import * as adminController from "../controllers/adminController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/admin/clear-faculty-data", requireAuth("admin"), adminController.clearFacultyData);
router.post("/admin/reset-submission", requireAuth("admin"), adminController.resetSubmission);
router.post("/admin/reset-all-submissions", requireAuth("admin"), adminController.resetAllSubmissions);
router.post("/admin/reset-password", requireAuth("admin"), adminController.resetPassword);
router.post("/admin/send-report", requireAuth("admin"), adminController.sendReport);

router.get("/admin/questions", requireAuth("admin"), adminController.getAdminQuestions);
router.put("/admin/questions", requireAuth("admin"), adminController.saveAdminQuestions);
router.get("/admin/submissions", requireAuth("admin"), adminController.getAdminSubmissions);
router.get("/admin/staff-list", requireAuth("admin"), adminController.getAdminStaffList);

router.get("/analytics/department/:departmentId", adminController.getDepartmentAnalytics);
router.get("/analytics/department/:departmentId/faculty", adminController.getDepartmentFacultyAnalytics);
router.get("/analytics/department/:departmentId/designation", adminController.getDepartmentDesignationAnalytics);
router.get("/analytics/faculty/:staffId", adminController.getFacultyAnalytics);

export default router;
