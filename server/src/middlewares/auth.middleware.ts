import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
  user?: { id: number; role: string }; // ⭐ Add this for compatibility
}

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    // ⭐ Debug logs
    console.log("🔍 Auth middleware - Headers:", {
      authorization: authHeader ? `${authHeader.substring(0, 20)}...` : "missing",
      contentType: req.headers["content-type"],
    });

    if (!authHeader) {
      console.error("❌ No authorization header");
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    // ⭐ Check format: "Bearer <token>"
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      console.error("❌ Invalid authorization header format");
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format. Expected 'Bearer <token>'" 
      });
    }

    const token = parts[1];

    if (!token) {
      console.error("❌ Token is empty");
      return res.status(401).json({ 
        success: false, 
        message: "Token is empty" 
      });
    }

    // ⭐ Verify token
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    
    console.log("✅ Token verified:", { userId: payload.userId, role: payload.role });

    // ⭐ Set both formats for compatibility
    req.userId = payload.userId;
    req.userRole = payload.role;
    req.user = { id: payload.userId, role: payload.role };

    next();
  } catch (err: any) {
    console.error("❌ Token verification failed:", err.message);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token format" 
      });
    }

    const token = parts[1];

    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    if (payload.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Admin access required" 
      });
    }

    req.userId = payload.userId;
    req.userRole = payload.role;
    req.user = { id: payload.userId, role: payload.role };

    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};