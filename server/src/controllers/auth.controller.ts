import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import * as authService from "../services/auth.service.js";

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await authService.getMe(userId);
    
    res.json({
      success: true,
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ⭐ Verify updateProfile controller
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId || req.user?.id;
    
    console.log("📥 Update profile request:", { userId, body: req.body }); // Debug log
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID",
      });
    }

    const user = await authService.updateProfile(userId, req.body);
    
    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (err: any) {
    console.error("❌ Update profile error:", err); // Debug log
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};