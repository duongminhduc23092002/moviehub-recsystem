import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import * as watchlistService from "../services/watchlist.service.js";

export const getWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    console.log("📥 GET /api/watchlist - User ID:", userId);
    
    const watchlist = await watchlistService.getUserWatchlist(userId);
    
    console.log(`✅ Returning ${watchlist.length} movies`);
    console.log("   First movie:", watchlist[0]?.title || "N/A");
    
    res.json({ 
      success: true, 
      data: watchlist 
    });
  } catch (err: any) {
    console.error("❌ Error in getWatchlist controller:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const movieId = Number(req.params.movieId);
    
    if (isNaN(movieId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid movie ID" 
      });
    }

    const result = await watchlistService.addToWatchlist(userId, movieId);
    res.json({ 
      success: true, 
      message: "Added to watchlist", 
      data: result 
    });
  } catch (err: any) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const movieId = Number(req.params.movieId);

    if (isNaN(movieId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid movie ID" 
      });
    }

    await watchlistService.removeFromWatchlist(userId, movieId);
    res.json({ 
      success: true, 
      message: "Removed from watchlist" 
    });
  } catch (err: any) {
    res.status(400).json({ 
      success: false, 
      message: err.message 
    });
  }
};

export const checkInWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const movieId = Number(req.params.movieId);

    if (isNaN(movieId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid movie ID" 
      });
    }

    const isInWatchlist = await watchlistService.isInWatchlist(userId, movieId);
    res.json({ 
      success: true, 
      data: { isInWatchlist } 
    });
  } catch (err: any) {
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

/**
 * ⭐ NEW: Get user's rated movies
 */
export const getRatedMovies = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const movies = await watchlistService.getUserRatedMovies(userId);

    res.json({
      success: true,
      data: movies,
      meta: {
        total: movies.length,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in getRatedMovies:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get rated movies",
    });
  }
};