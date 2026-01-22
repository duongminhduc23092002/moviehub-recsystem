import { Request, Response } from "express";
import * as adminGenresService from "../../services/admin/admin.genres.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await adminGenresService.getAll(req.query);
    res.json(successResponse(result.data, "Genres retrieved successfully", result.meta));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const genre = await adminGenresService.getById(id);
    if (!genre) {
      return res.status(404).json(errorResponse("Genre not found"));
    }
    res.json(successResponse(genre, "Genre retrieved successfully"));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json(errorResponse("Name is required"));
    }
    const genre = await adminGenresService.create(name);
    res.status(201).json(successResponse(genre, "Genre created successfully"));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;
    if (!name) {
      return res.status(400).json(errorResponse("Name is required"));
    }
    const genre = await adminGenresService.update(id, name);
    res.json(successResponse(genre, "Genre updated successfully"));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await adminGenresService.remove(id);
    res.json(successResponse(null, "Genre deleted successfully"));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};