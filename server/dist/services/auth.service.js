import prisma from "../prisma/client.js";
// import bcrypt from "bcryptjs"; // ⭐ Comment out bcrypt
import { generateToken } from "../utils/jwt.js";
export const register = async (data) => {
    const existingUser = await prisma.users.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error("Email already registered");
    }
    // ⭐ Store password as plaintext (NOT RECOMMENDED FOR PRODUCTION)
    const user = await prisma.users.create({
        data: {
            name: data.name,
            email: data.email,
            password: data.password, // ⭐ No hashing
            role: "user",
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
    });
    const token = generateToken(user.id, user.role);
    console.log("✅ User registered:", { id: user.id, email: user.email, role: user.role });
    return { user, token };
};
export const login = async (data) => {
    console.log("🔐 Login attempt for email:", data.email);
    const user = await prisma.users.findUnique({
        where: { email: data.email },
    });
    if (!user) {
        console.log("❌ User not found:", data.email);
        throw new Error("Invalid email or password");
    }
    console.log("👤 User found:", { id: user.id, email: user.email, role: user.role });
    // ⭐ Direct password comparison (NO BCRYPT)
    if (user.password !== data.password) {
        console.log("❌ Invalid password for user:", user.email);
        throw new Error("Invalid email or password");
    }
    console.log("✅ Password validated for user:", user.email);
    const token = generateToken(user.id, user.role);
    console.log("🔑 Token generated for user:", {
        id: user.id,
        email: user.email,
        role: user.role,
        tokenPreview: token.substring(0, 20) + "..."
    });
    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        },
        token,
    };
};
export const getMe = async (userId) => {
    const user = await prisma.users.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    return user;
};
export const updateProfile = async (userId, data) => {
    console.log("🔍 updateProfile called with:", { userId, data });
    if (!data.name && !data.email && !data.password) {
        throw new Error("No data to update");
    }
    if (data.email) {
        const existingUser = await prisma.users.findFirst({
            where: {
                email: data.email,
                NOT: { id: userId },
            },
        });
        if (existingUser) {
            throw new Error("Email already in use by another account");
        }
    }
    const updateData = {};
    if (data.name && data.name.trim()) {
        updateData.name = data.name.trim();
    }
    if (data.email && data.email.trim()) {
        updateData.email = data.email.trim();
    }
    // ⭐ Store password as plaintext (NO HASHING)
    if (data.password && data.password.trim()) {
        updateData.password = data.password.trim();
    }
    console.log("📝 Update data:", updateData);
    const updatedUser = await prisma.users.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            created_at: true,
        },
    });
    console.log("✅ User updated:", updatedUser);
    return updatedUser;
};
