import express from "express";
import * as questionController from "../controllers/questionController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/departments", questionController.getDepartments);
router.get("/designations", questionController.getDesignations);
router.get("/questions", requireAuth(), questionController.getQuestions);
router.get("/questions/assigned/:staffId", questionController.getQuestionsAssigned);

export default router;
