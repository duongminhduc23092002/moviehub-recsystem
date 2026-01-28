import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import * as recommendationService from "../services/recommendation.service.js";

export const getRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    console.log("🎬 Recommendation request:", {
      userId,
      hasAuth: !!req.user,
      headers: req.headers.authorization ? "present" : "missing",
    });

    if (!userId) {
      console.error("❌ No user ID found");
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please login",
      });
    }

    console.log(`🔄 Fetching recommendations for user ${userId}...`);

    // ⭐ FIX: getRecommendedMovies already returns FULL movie objects
    const movies = await recommendationService.getRecommendedMovies(userId);

    console.log(`✅ Found ${movies.length} movies in database`);

    // Return success even if no movies (user might not have enough data)
    res.json({
      success: true,
      data: movies,
      meta: {
        total: movies.length,
        algorithm: "collaborative_filtering",
        message: movies.length === 0 
          ? "Not enough data for recommendations. Please watch and rate more movies."
          : undefined,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in getRecommendations:");
    console.error("   Message:", error.message);
    console.error("   Stack:", error.stack);

    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
      error: process.env.NODE_ENV === "development" ? {
        message: error.message,
        stack: error.stack,
      } : undefined,
    });
  }
};