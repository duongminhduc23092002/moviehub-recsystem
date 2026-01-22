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
    try {
        const [genres, total] = await Promise.all([
            prisma.genres.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: "asc" },
                include: {
                    _count: {
                        select: { movie_genres: true },
                    },
                },
            }),
            prisma.genres.count({ where }),
        ]);
        const data = genres.map((g) => ({
            id: g.id,
            name: g.name,
            moviesCount: g._count.movie_genres,
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
        console.error("❌ Error in getAll genres:", error);
        throw new Error("Failed to fetch genres");
    }
};
export const getById = async (id) => {
    try {
        const genre = await prisma.genres.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { movie_genres: true },
                },
            },
        });
        if (!genre)
            return null;
        return {
            id: genre.id,
            name: genre.name,
            moviesCount: genre._count.movie_genres,
        };
    }
    catch (error) {
        console.error("❌ Error in getById genre:", error);
        throw new Error("Failed to fetch genre");
    }
};
export const create = async (name) => {
    if (!name || !name.trim()) {
        throw new Error("Genre name is required");
    }
    try {
        // Check if genre already exists
        const existing = await prisma.genres.findFirst({
            where: { name: name.trim() },
        });
        if (existing) {
            throw new Error("Genre already exists");
        }
        return await prisma.genres.create({
            data: { name: name.trim() },
        });
    }
    catch (error) {
        console.error("❌ Error in create genre:", error);
        if (error.message === "Genre already exists") {
            throw error;
        }
        throw new Error("Failed to create genre");
    }
};
export const update = async (id, name) => {
    if (!name || !name.trim()) {
        throw new Error("Genre name is required");
    }
    try {
        // Check if another genre with same name exists
        const existing = await prisma.genres.findFirst({
            where: {
                name: name.trim(),
                NOT: { id },
            },
        });
        if (existing) {
            throw new Error("Genre name already exists");
        }
        return await prisma.genres.update({
            where: { id },
            data: { name: name.trim() },
        });
    }
    catch (error) {
        console.error("❌ Error in update genre:", error);
        if (error.message === "Genre name already exists") {
            throw error;
        }
        throw new Error("Failed to update genre");
    }
};
export const remove = async (id) => {
    try {
        // Check if genre is being used by movies
        const moviesUsingGenre = await prisma.movie_genres.count({
            where: { genre_id: id },
        });
        if (moviesUsingGenre > 0) {
            throw new Error(`Cannot delete genre. It is used by ${moviesUsingGenre} movie(s)`);
        }
        await prisma.genres.delete({ where: { id } });
        return true;
    }
    catch (error) {
        console.error("❌ Error in remove genre:", error);
        if (error.message.includes("Cannot delete genre")) {
            throw error;
        }
        throw new Error("Failed to delete genre");
    }
};
