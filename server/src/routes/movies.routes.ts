import { Router } from "express";
import * as controller from "../controllers/movies.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", controller.getAll);
router.get("/top-rated", controller.getTopRated);
router.get("/genres", controller.getGenres); 
router.get("/:id", controller.getById);
router.get("/:id/similar", controller.getSimilarMovies); // ⭐ NEW
router.get("/:id/ratings", controller.getMovieRatings);

// Protected routes
router.post("/:id/rate", requireAuth, controller.rateMovie);
router.get("/:id/my-rating", requireAuth, controller.getMyRating);
router.delete("/:id/rate", requireAuth, controller.deleteRating);

export default router;