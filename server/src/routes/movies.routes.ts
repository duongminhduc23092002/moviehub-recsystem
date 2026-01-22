import { Router } from "express";
import * as moviesController from "../controllers/movies.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", moviesController.getAll);
router.get("/genres", moviesController.getGenres);
router.get("/top-rated", moviesController.getTopRated);
router.get("/:id", moviesController.getById);
router.get("/:id/ratings", moviesController.getRatings);

// ⭐ Protected route - MUST use requireAuth
router.post("/:id/rate", requireAuth, moviesController.rateMovie);

export default router;