import * as adminGenresService from "../../services/admin/admin.genres.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export const getAll = async (req, res) => {
    try {
        const result = await adminGenresService.getAll(req.query);
        res.json(successResponse(result.data, "Genres retrieved successfully", result.meta));
    }
    catch (err) {
        res.status(500).json(errorResponse(err.message));
    }
};
export const getById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const genre = await adminGenresService.getById(id);
        if (!genre) {
            return res.status(404).json(errorResponse("Genre not found"));
        }
        res.json(successResponse(genre, "Genre retrieved successfully"));
    }
    catch (err) {
        res.status(500).json(errorResponse(err.message));
    }
};
export const create = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json(errorResponse("Name is required"));
        }
        const genre = await adminGenresService.create(name);
        res.status(201).json(successResponse(genre, "Genre created successfully"));
    }
    catch (err) {
        res.status(400).json(errorResponse(err.message));
    }
};
export const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body;
        if (!name) {
            return res.status(400).json(errorResponse("Name is required"));
        }
        const genre = await adminGenresService.update(id, name);
        res.json(successResponse(genre, "Genre updated successfully"));
    }
    catch (err) {
        res.status(400).json(errorResponse(err.message));
    }
};
export const remove = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await adminGenresService.remove(id);
        res.json(successResponse(null, "Genre deleted successfully"));
    }
    catch (err) {
        res.status(400).json(errorResponse(err.message));
    }
};
