import express from "express";
import * as facultyController from "../controllers/facultyController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/faculty", facultyController.getFacultyList);
router.get("/faculty/department/:departmentId", facultyController.getFacultyByDepartment);
router.get("/faculty/:staffId", facultyController.getFacultyByStaffId);

router.post("/faculty", requireAuth("admin"), facultyController.createFaculty);
router.post("/faculty/bulk", requireAuth("admin"), facultyController.bulkCreateFaculty);
router.put("/faculty/:username", requireAuth("admin"), facultyController.updateFaculty);
router.delete("/faculty/:username", requireAuth("admin"), facultyController.deleteFaculty);

router.get("/faculty/:staffId/academic-details", facultyController.getAcademicDetails);
router.post("/faculty/:staffId/academic-details", requireAuth(), facultyController.saveAcademicDetails);

router.get("/reports/faculty/export", requireAuth(), facultyController.exportFacultyReport);

export default router;
