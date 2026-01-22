import * as moviesService from "../services/movies.service.js";
import prisma from "../prisma/client.js";
export const getAll = async (req, res) => {
    try {
        const result = await moviesService.getAll(req.query);
        res.json({
            success: true,
            ...result,
        });
    }
    catch (err) {
        console.error('Error in getAll movies:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
export const getById = async (req, res) => {
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
    }
    catch (err) {
        console.error('Error in getById movie:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
export const getRatings = async (req, res) => {
    try {
        const ratings = await moviesService.getRatings(Number(req.params.id));
        res.json({
            success: true,
            data: ratings,
        });
    }
    catch (err) {
        console.error('Error in getRatings:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
// ⭐ Fix: Use AuthRequest type and check req.userId or req.user
export const rateMovie = async (req, res) => {
    try {
        // ⭐ Try both req.userId and req.user.id
        const userId = req.userId || req.user?.id;
        console.log("🎬 Rate movie request:", {
            userId,
            movieId: req.params.id,
            body: req.body,
            headers: req.headers.authorization ? "present" : "missing",
        });
        if (!userId) {
            console.error("❌ No user ID found in request");
            return res.status(401).json({
                success: false,
                message: "Unauthorized - User ID not found"
            });
        }
        const movieId = Number(req.params.id);
        const { score, comment } = req.body;
        // ⭐ Validate inputs
        if (isNaN(movieId) || movieId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie ID"
            });
        }
        if (!score || score < 1 || score > 5) {
            return res.status(400).json({
                success: false,
                message: "Score must be between 1 and 5"
            });
        }
        const rating = await moviesService.rateMovie({
            userId,
            movieId,
            score: Number(score),
            comment: comment?.trim(),
        });
        console.log("✅ Rating created/updated successfully");
        res.json({
            success: true,
            data: rating,
            message: "Movie rated successfully",
        });
    }
    catch (err) {
        console.error('❌ Error in rateMovie:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
export const getTopRated = async (req, res) => {
    try {
        const limit = Math.min(50, Number(req.query.limit || 10));
        const data = await moviesService.getTopRatedMovies(limit);
        res.json({
            success: true,
            data,
            meta: {
                total: data.length,
                minRating: 4.5,
            },
        });
    }
    catch (err) {
        console.error('Error in getTopRated:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
export const getGenres = async (req, res) => {
    try {
        const genres = await prisma.genres.findMany({
            orderBy: { name: "asc" },
        });
        res.json({
            success: true,
            data: genres,
        });
    }
    catch (err) {
        console.error('Error in getGenres:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
