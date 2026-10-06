import express from "express";
import * as authController from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/login", authController.login);
router.post("/auth/logout", requireAuth(), authController.logout);
router.get("/me", requireAuth(), authController.me);
router.post("/auth/change-password", requireAuth(), authController.changePassword);

export default router;
