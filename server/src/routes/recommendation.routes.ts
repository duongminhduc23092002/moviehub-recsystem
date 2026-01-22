import { Router } from "express";
import * as recommendationController from "../controllers/recommendation.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected route - require authentication
router.get("/", requireAuth, recommendationController.getRecommendations);

export default router;