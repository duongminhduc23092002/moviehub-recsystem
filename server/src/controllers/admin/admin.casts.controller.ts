import { Request, Response } from "express";
import * as adminCastsService from "../../services/admin/admin.casts.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";

export const getAll = async (req: Request, res: Response) => {
  try {
    const result = await adminCastsService.getAll(req.query);
    res.json(successResponse(result.data, "Casts retrieved successfully", result.meta));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const cast = await adminCastsService.getById(id);
    if (!cast) {
      return res.status(404).json(errorResponse("Cast not found"));
    }
    res.json(successResponse(cast, "Cast retrieved successfully"));
  } catch (err: any) {
    res.status(500).json(errorResponse(err.message));
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const { name, role } = req.body;
    if (!name || !role) {
      return res.status(400).json(errorResponse("Name and role are required"));
    }
    const cast = await adminCastsService.create(req.body);
    res.status(201).json(successResponse(cast, "Cast created successfully"));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const cast = await adminCastsService.update(id, req.body);
    res.json(successResponse(cast, "Cast updated successfully"));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await adminCastsService.remove(id);
    res.json(successResponse(null, "Cast deleted successfully"));
  } catch (err: any) {
    res.status(400).json(errorResponse(err.message));
  }
};