import prisma from "../../prisma/client.js";
// const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10); // ⭐ Not needed
export const getAll = async (query) => {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Number(query.limit || 10));
    const skip = (page - 1) * limit;
    const search = query.search ? String(query.search) : undefined;
    const where = {};
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { email: { contains: search } },
        ];
    }
    if (query.role) {
        where.role = query.role;
    }
    try {
        const [users, total] = await Promise.all([
            prisma.users.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    created_at: true,
                    _count: {
                        select: { ratings: true },
                    },
                },
            }),
            prisma.users.count({ where }),
        ]);
        const data = users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            created_at: u.created_at,
            ratingsCount: u._count.ratings,
        }));
        return {
            data,
            meta: {
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }
    catch (error) {
        console.error("❌ Error in getAll users:", error);
        throw new Error("Failed to fetch users");
    }
};
export const getById = async (id) => {
    try {
        const user = await prisma.users.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
                _count: {
                    select: { ratings: true },
                },
            },
        });
        if (!user)
            return null;
        return {
            ...user,
            ratingsCount: user._count.ratings,
        };
    }
    catch (error) {
        console.error("❌ Error in getById user:", error);
        throw new Error("Failed to fetch user");
    }
};
export const create = async (input) => {
    if (!input.name || !input.name.trim()) {
        throw new Error("Name is required");
    }
    if (!input.email || !input.email.trim()) {
        throw new Error("Email is required");
    }
    if (!input.password || !input.password.trim()) {
        throw new Error("Password is required");
    }
    try {
        const existing = await prisma.users.findUnique({
            where: { email: input.email.trim() },
        });
        if (existing) {
            throw new Error("Email already exists");
        }
        // ⭐ Store password as plaintext (NO HASHING)
        const user = await prisma.users.create({
            data: {
                name: input.name.trim(),
                email: input.email.trim(),
                password: input.password.trim(), // ⭐ No bcrypt.hash()
                role: input.role || "user",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });
        return user;
    }
    catch (error) {
        console.error("❌ Error in create user:", error);
        if (error.message === "Email already exists") {
            throw error;
        }
        throw new Error("Failed to create user");
    }
};
export const update = async (id, input) => {
    try {
        const updateData = {};
        if (input.name !== undefined) {
            if (!input.name.trim()) {
                throw new Error("Name cannot be empty");
            }
            updateData.name = input.name.trim();
        }
        if (input.email !== undefined) {
            if (!input.email.trim()) {
                throw new Error("Email cannot be empty");
            }
            const existing = await prisma.users.findFirst({
                where: {
                    email: input.email.trim(),
                    NOT: { id },
                },
            });
            if (existing) {
                throw new Error("Email already in use");
            }
            updateData.email = input.email.trim();
        }
        // ⭐ Store password as plaintext (NO HASHING)
        if (input.password && input.password.trim()) {
            updateData.password = input.password.trim(); // ⭐ No bcrypt.hash()
        }
        if (input.role !== undefined) {
            if (!["user", "admin"].includes(input.role)) {
                throw new Error("Valid role is required (user or admin)");
            }
            updateData.role = input.role;
        }
        return await prisma.users.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });
    }
    catch (error) {
        console.error("❌ Error in update user:", error);
        if (error.message.includes("cannot be empty") ||
            error.message === "Email already in use" ||
            error.message.includes("Valid role")) {
            throw error;
        }
        throw new Error("Failed to update user");
    }
};
export const updateRole = async (id, role) => {
    if (!["user", "admin"].includes(role)) {
        throw new Error("Valid role is required (user or admin)");
    }
    try {
        return await prisma.users.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                created_at: true,
            },
        });
    }
    catch (error) {
        console.error("❌ Error in updateRole:", error);
        throw new Error("Failed to update user role");
    }
};
export const remove = async (id) => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.ratings.deleteMany({
                where: { user_id: id },
            });
            await tx.watchlist.deleteMany({
                where: { user_id: id },
            });
            await tx.users.delete({
                where: { id },
            });
        });
        return true;
    }
    catch (error) {
        console.error("❌ Error in remove user:", error);
        throw new Error("Failed to delete user");
    }
};
