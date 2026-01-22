import prisma from "../../prisma/client.js";
export const getAll = async (query) => {
    console.log("🔍 Admin getAll movies called with query:", query); // Debug log
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Number(query.limit || 10));
    const skip = (page - 1) * limit;
    const search = query.search ? String(query.search) : undefined;
    const where = {};
    if (search) {
        where.OR = [
            { title: { contains: search } },
            { description: { contains: search } },
        ];
    }
    try {
        const [movies, total] = await Promise.all([
            prisma.movies.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    movie_genres: { include: { genres: true } },
                    movie_casts: { include: { people: true } },
                    ratings: {
                        select: { score: true }
                    },
                },
            }),
            prisma.movies.count({ where }),
        ]);
        console.log(`✅ Found ${movies.length} movies out of ${total} total`); // Debug log
        // Map to proper format
        const data = movies.map((m) => {
            const ratings = m.ratings || [];
            const avgRating = ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
                : 0;
            return {
                id: m.id,
                title: m.title,
                description: m.description,
                poster: m.poster,
                year: m.year,
                duration: m.duration,
                trailer_url: m.trailer_url,
                avgRating: Number(avgRating.toFixed(1)),
                genres: m.movie_genres.map((mg) => ({
                    id: mg.genres.id,
                    name: mg.genres.name,
                })),
                casts: m.movie_casts.map((mc) => ({
                    id: mc.people.id,
                    name: mc.people.name,
                    role: mc.people.role,
                })),
            };
        });
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
        console.error("❌ Error in admin getAll movies:", error);
        throw new Error("Failed to fetch movies");
    }
};
export const getById = async (id) => {
    try {
        const movie = await prisma.movies.findUnique({
            where: { id },
            include: {
                movie_genres: { include: { genres: true } },
                movie_casts: { include: { people: true } },
            },
        });
        if (!movie)
            return null;
        return {
            ...movie,
            genres: movie.movie_genres.map((mg) => mg.genres),
            casts: movie.movie_casts.map((mc) => mc.people),
        };
    }
    catch (error) {
        console.error("❌ Error in admin getById movie:", error);
        throw new Error("Failed to fetch movie");
    }
};
export const create = async (input) => {
    if (!input.title || !input.title.trim()) {
        throw new Error("Title is required");
    }
    try {
        const { genreIds, castIds, ...movieData } = input;
        const movie = await prisma.movies.create({
            data: {
                ...movieData,
                title: movieData.title.trim(),
                movie_genres: genreIds?.length
                    ? { create: genreIds.map((gid) => ({ genre_id: gid })) }
                    : undefined,
                movie_casts: castIds?.length
                    ? { create: castIds.map((c) => ({ person_id: c.personId, acting_role: c.role })) }
                    : undefined,
            },
            include: {
                movie_genres: { include: { genres: true } },
                movie_casts: { include: { people: true } },
            },
        });
        console.log("✅ Movie created:", movie.id); // Debug log
        return {
            ...movie,
            genres: movie.movie_genres.map((mg) => mg.genres),
            casts: movie.movie_casts.map((mc) => mc.people),
        };
    }
    catch (error) {
        console.error("❌ Error in admin create movie:", error);
        throw new Error("Failed to create movie");
    }
};
export const update = async (id, input) => {
    try {
        const { genreIds, castIds, ...movieData } = input;
        // Xóa genres và casts cũ
        await prisma.movie_genres.deleteMany({ where: { movie_id: id } });
        await prisma.movie_casts.deleteMany({ where: { movie_id: id } });
        const movie = await prisma.movies.update({
            where: { id },
            data: {
                ...movieData,
                movie_genres: genreIds?.length
                    ? { create: genreIds.map((gid) => ({ genre_id: gid })) }
                    : undefined,
                movie_casts: castIds?.length
                    ? { create: castIds.map((c) => ({ person_id: c.personId, acting_role: c.role })) }
                    : undefined,
            },
            include: {
                movie_genres: { include: { genres: true } },
                movie_casts: { include: { people: true } },
            },
        });
        console.log("✅ Movie updated:", movie.id); // Debug log
        return {
            ...movie,
            genres: movie.movie_genres.map((mg) => mg.genres),
            casts: movie.movie_casts.map((mc) => mc.people),
        };
    }
    catch (error) {
        console.error("❌ Error in admin update movie:", error);
        throw new Error("Failed to update movie");
    }
};
export const remove = async (id) => {
    try {
        // Delete related data first
        await prisma.$transaction(async (tx) => {
            // Delete ratings
            await tx.ratings.deleteMany({ where: { movie_id: id } });
            // Delete watchlist entries
            await tx.watchlist.deleteMany({ where: { movie_id: id } });
            // Delete genres relationship
            await tx.movie_genres.deleteMany({ where: { movie_id: id } });
            // Delete casts relationship
            await tx.movie_casts.deleteMany({ where: { movie_id: id } });
            // Delete movie
            await tx.movies.delete({ where: { id } });
        });
        console.log("✅ Movie deleted:", id); // Debug log
        return true;
    }
    catch (error) {
        console.error("❌ Error in admin remove movie:", error);
        throw new Error("Failed to delete movie");
    }
};
