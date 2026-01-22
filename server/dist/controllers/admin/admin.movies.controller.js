import * as adminMoviesService from "../../services/admin/admin.movies.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export const getAll = async (req, res) => {
    try {
        console.log("📥 Admin GET /movies request with query:", req.query); // Debug log
        const result = await adminMoviesService.getAll(req.query);
        console.log("📤 Admin GET /movies response:", {
            dataLength: result.data.length,
            total: result.meta.total
        }); // Debug log
        res.json(successResponse(result.data, "Movies retrieved successfully", result.meta));
    }
    catch (err) {
        console.error("❌ Admin GET /movies error:", err); // Debug log
        res.status(500).json(errorResponse(err.message));
    }
};
export const getById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json(errorResponse("Invalid movie ID"));
        }
        const movie = await adminMoviesService.getById(id);
        if (!movie) {
            return res.status(404).json(errorResponse("Movie not found"));
        }
        res.json(successResponse(movie, "Movie retrieved successfully"));
    }
    catch (err) {
        console.error("❌ Admin GET /movies/:id error:", err);
        res.status(500).json(errorResponse(err.message));
    }
};
export const create = async (req, res) => {
    try {
        console.log("📥 Admin POST /movies request body:", req.body); // Debug log
        const movie = await adminMoviesService.create(req.body);
        res.status(201).json(successResponse(movie, "Movie created successfully"));
    }
    catch (err) {
        console.error("❌ Admin POST /movies error:", err);
        res.status(400).json(errorResponse(err.message));
    }
};
export const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json(errorResponse("Invalid movie ID"));
        }
        console.log("📥 Admin PUT /movies/:id request body:", req.body); // Debug log
        const movie = await adminMoviesService.update(id, req.body);
        res.json(successResponse(movie, "Movie updated successfully"));
    }
    catch (err) {
        console.error("❌ Admin PUT /movies/:id error:", err);
        res.status(400).json(errorResponse(err.message));
    }
};
export const remove = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id) || id <= 0) {
            return res.status(400).json(errorResponse("Invalid movie ID"));
        }
        await adminMoviesService.remove(id);
        res.json(successResponse(null, "Movie deleted successfully"));
    }
    catch (err) {
        console.error("❌ Admin DELETE /movies/:id error:", err);
        res.status(400).json(errorResponse(err.message));
    }
};
