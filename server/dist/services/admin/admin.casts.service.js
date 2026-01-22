import prisma from "../../prisma/client.js";
export const getAll = async (query) => {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Number(query.limit || 10));
    const skip = (page - 1) * limit;
    const search = query.search ? String(query.search) : undefined;
    const where = {};
    if (search) {
        where.name = { contains: search };
    }
    if (query.role) {
        where.role = query.role;
    }
    try {
        const [people, total] = await Promise.all([
            prisma.people.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" },
                include: {
                    _count: { select: { movie_casts: true } },
                },
            }),
            prisma.people.count({ where }),
        ]);
        const data = people.map((p) => ({
            ...p,
            moviesCount: p._count.movie_casts,
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
        console.error("❌ Error in getAll casts:", error);
        throw new Error("Failed to fetch casts");
    }
};
export const getById = async (id) => {
    try {
        const person = await prisma.people.findUnique({
            where: { id },
            include: {
                _count: { select: { movie_casts: true } },
            },
        });
        if (!person)
            return null;
        return {
            ...person,
            moviesCount: person._count.movie_casts,
        };
    }
    catch (error) {
        console.error("❌ Error in getById cast:", error);
        throw new Error("Failed to fetch cast");
    }
};
export const create = async (input) => {
    if (!input.name || !input.name.trim()) {
        throw new Error("Name is required");
    }
    if (!input.role || !["actor", "director"].includes(input.role)) {
        throw new Error("Valid role is required (actor or director)");
    }
    try {
        return await prisma.people.create({
            data: {
                name: input.name.trim(),
                role: input.role,
                avatar: input.avatar || null,
                birthday: input.birthday ? new Date(input.birthday) : null,
                biography: input.biography || null,
            },
        });
    }
    catch (error) {
        console.error("❌ Error in create cast:", error);
        throw new Error("Failed to create cast");
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
        if (input.role !== undefined) {
            if (!["actor", "director"].includes(input.role)) {
                throw new Error("Valid role is required (actor or director)");
            }
            updateData.role = input.role;
        }
        if (input.avatar !== undefined) {
            updateData.avatar = input.avatar || null;
        }
        if (input.birthday !== undefined) {
            updateData.birthday = input.birthday ? new Date(input.birthday) : null;
        }
        if (input.biography !== undefined) {
            updateData.biography = input.biography || null;
        }
        return await prisma.people.update({
            where: { id },
            data: updateData,
        });
    }
    catch (error) {
        console.error("❌ Error in update cast:", error);
        if (error.message.includes("Name cannot be empty") || error.message.includes("Valid role")) {
            throw error;
        }
        throw new Error("Failed to update cast");
    }
};
export const remove = async (id) => {
    try {
        // Check if cast is being used in movies
        const moviesUsingCast = await prisma.movie_casts.count({
            where: { person_id: id },
        });
        if (moviesUsingCast > 0) {
            throw new Error(`Cannot delete cast. They are in ${moviesUsingCast} movie(s)`);
        }
        await prisma.people.delete({ where: { id } });
        return true;
    }
    catch (error) {
        console.error("❌ Error in remove cast:", error);
        if (error.message.includes("Cannot delete cast")) {
            throw error;
        }
        throw new Error("Failed to delete cast");
    }
};
