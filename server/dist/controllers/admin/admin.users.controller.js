import * as adminUsersService from "../../services/admin/admin.users.service.js";
import { successResponse, errorResponse } from "../../utils/response.js";
export const getAll = async (req, res) => {
    try {
        const result = await adminUsersService.getAll(req.query);
        res.json(successResponse(result.data, "Users retrieved successfully", result.meta));
    }
    catch (err) {
        res.status(500).json(errorResponse(err.message));
    }
};
export const getById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = await adminUsersService.getById(id);
        if (!user) {
            return res.status(404).json(errorResponse("User not found"));
        }
        res.json(successResponse(user, "User retrieved successfully"));
    }
    catch (err) {
        res.status(500).json(errorResponse(err.message));
    }
};
export const create = async (req, res) => {
    try {
        const user = await adminUsersService.create(req.body);
        res.status(201).json(successResponse(user, "User created successfully"));
    }
    catch (err) {
        res.status(400).json(errorResponse(err.message));
    }
};
export const update = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const user = await adminUsersService.update(id, req.body);
        res.json(successResponse(user, "User updated successfully"));
    }
    catch (err) {
        res.status(400).json(errorResponse(err.message));
    }
};
export const updateRole = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { role } = req.body;
        if (!role || !["user", "admin"].includes(role)) {
            return res.status(400).json(errorResponse("Valid role is required (user or admin)"));
        }
        const user = await adminUsersService.updateRole(id, role);
        res.json(successResponse(user, "User role updated successfully"));
    }
    catch (err) {
        res.status(400).json(errorResponse(err.message));
    }
};
export const remove = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await adminUsersService.remove(id);
        res.json(successResponse(null, "User deleted successfully"));
    }
    catch (err) {
        res.status(400).json(errorResponse(err.message));
    }
};
