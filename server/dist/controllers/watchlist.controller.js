import * as watchlistService from "../services/watchlist.service.js";
export const getWatchlist = async (req, res) => {
    try {
        const userId = req.userId;
        const watchlist = await watchlistService.getUserWatchlist(userId);
        // ⭐ Debug log
        console.log(`Fetching watchlist for user ${userId}:`, watchlist);
        res.json({
            success: true,
            data: watchlist // Must be array
        });
    }
    catch (err) {
        console.error("Error in getWatchlist controller:", err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
export const addToWatchlist = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
export const removeFromWatchlist = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};
export const checkInWatchlist = async (req, res) => {
    try {
        const userId = req.userId;
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
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
