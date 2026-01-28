import { Router } from "express";
import * as watchlistController from "../controllers/watchlist.controller.js"; // ⭐ Add .js extension
import { requireAuth } from "../middlewares/auth.middleware.js"; // ⭐ Fix: middlewares (plural) và .js extension

const router = Router();

router.get("/", requireAuth, watchlistController.getWatchlist);
router.get("/rated", requireAuth, watchlistController.getRatedMovies); // ⭐ NEW
router.post("/:movieId", requireAuth, watchlistController.addToWatchlist);
router.delete("/:movieId", requireAuth, watchlistController.removeFromWatchlist);
router.get("/:movieId/check", requireAuth, watchlistController.checkInWatchlist);

export default router;