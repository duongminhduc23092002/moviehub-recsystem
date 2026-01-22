import { Router } from "express";
import * as watchlistController from "../controllers/watchlist.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// All routes require authentication
router.use(requireAuth);

router.get("/", watchlistController.getWatchlist);
router.post("/:movieId", watchlistController.addToWatchlist);
router.delete("/:movieId", watchlistController.removeFromWatchlist);
router.get("/:movieId/check", watchlistController.checkInWatchlist);

export default router;