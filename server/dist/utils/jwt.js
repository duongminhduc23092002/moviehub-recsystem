import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";
// ⭐ MUST include role parameter
export const generateToken = (userId, role) => {
    const payload = { userId, role };
    console.log("🔑 Generating JWT token with payload:", payload); // Debug
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    return token;
};
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("✅ Token verified:", decoded); // Debug
        return decoded;
    }
    catch (error) {
        console.error("❌ Token verification failed:", error);
        throw new Error("Invalid token");
    }
};
