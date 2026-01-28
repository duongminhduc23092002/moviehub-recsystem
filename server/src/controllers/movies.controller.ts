import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import * as moviesService from "../services/movies.service.js";
import prisma from "../prisma/client.js"; // ⭐ ADD THIS

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await moviesService.getAll(req.query);
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error('Error in getAll movies:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid movie ID" 
      });
    }

    const movie = await moviesService.getById(id);
    
    if (!movie) {
      return res.status(404).json({ 
        success: false,
        message: "Movie not found" 
      });
    }

    res.json({
      success: true,
      data: movie,
    });
  } catch (err: any) {
    console.error('Error in getById movie:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

export const getTopRated = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(50, Number(req.query.limit || 10));
    const data = await moviesService.getTopRatedMovies(limit);
    
    res.json({
      success: true,
      data,
      meta: {
        total: data.length,
        sortedBy: 'final_score',
        description: 'Top phim được xếp hạng dựa trên điểm tổng hợp (final_score)',
      },
    });
  } catch (err: any) {
    console.error('❌ Error in getTopRated:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// ⭐ FIX: getGenres - Now uses prisma (imported above)
export const getGenres = async (req: Request, res: Response) => {
  try {
    const genres = await prisma.genres.findMany({
      orderBy: { name: "asc" },
    });
    res.json({
      success: true,
      data: genres,
    });
  } catch (err: any) {
    console.error('Error in getGenres:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

/**
 * Rate a movie (POST /api/movies/:id/rate)
 */
export const rateMovie = async (req: AuthRequest, res: Response) => {
  try {
    const movieId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { rating, comment } = req.body;

    console.log(`📥 POST /api/movies/${movieId}/rate - User ${userId}`);
    console.log(`   Rating: ${rating}/10`);
    console.log(`   Comment: ${comment || 'No comment'}`);

    if (!rating || rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 10",
      });
    }

    const result = await moviesService.rateMovie({
      userId,
      movieId,
      rating,
      comment,
    });

    res.json({
      success: true,
      data: result,
      message: "Rating submitted successfully",
    });
  } catch (err: any) {
    console.error("❌ Error in rateMovie:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to rate movie",
    });
  }
};

/**
 * Get all ratings for a movie (GET /api/movies/:id/ratings)
 */
export const getMovieRatings = async (req: Request, res: Response) => {
  try {
    const movieId = parseInt(req.params.id);

    console.log(`📥 GET /api/movies/${movieId}/ratings`);

    const ratings = await moviesService.getMovieRatings(movieId);

    res.json({
      success: true,
      data: ratings,
      meta: {
        total: ratings.length,
      },
    });
  } catch (err: any) {
    console.error("❌ Error in getMovieRatings:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to get ratings",
    });
  }
};

/**
 * Get user's rating for a movie (GET /api/movies/:id/my-rating)
 */
export const getMyRating = async (req: AuthRequest, res: Response) => {
  try {
    const movieId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log(`📥 GET /api/movies/${movieId}/my-rating - User ${userId}`);

    const rating = await moviesService.getUserRatingForMovie(userId, movieId);

    res.json({
      success: true,
      data: rating,
    });
  } catch (err: any) {
    console.error("❌ Error in getMyRating:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to get rating",
    });
  }
};

/**
 * Delete user's rating (DELETE /api/movies/:id/rate)
 */
export const deleteRating = async (req: AuthRequest, res: Response) => {
  try {
    const movieId = parseInt(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    console.log(`📥 DELETE /api/movies/${movieId}/rate - User ${userId}`);

    await moviesService.deleteRating(userId, movieId);

    res.json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (err: any) {
    console.error("❌ Error in deleteRating:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to delete rating",
    });
  }
};