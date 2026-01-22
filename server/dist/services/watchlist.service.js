import prisma from "../prisma/client.js";
export const getUserWatchlist = async (userId) => {
    const watchlist = await prisma.watchlist.findMany({
        where: { user_id: userId },
        include: {
            movies: {
                include: {
                    movie_genres: { include: { genres: true } },
                    ratings: true,
                },
            },
        },
        orderBy: { added_at: "desc" },
    });
    // ⭐ Map to proper format and ensure it's an array
    const result = watchlist.map((w) => ({
        id: w.movies.id,
        title: w.movies.title,
        description: w.movies.description,
        poster: w.movies.poster,
        year: w.movies.year,
        duration: w.movies.duration,
        added_at: w.added_at,
        genres: w.movies.movie_genres.map((mg) => mg.genres),
        avgRating: w.movies.ratings.length
            ? w.movies.ratings.reduce((s, r) => s + (r.score || 0), 0) / w.movies.ratings.length
            : null,
    }));
    console.log(`Watchlist for user ${userId}:`, result); // Debug log
    return result; // Must be array
};
export const addToWatchlist = async (userId, movieId) => {
    // Check if movie exists
    const movie = await prisma.movies.findUnique({ where: { id: movieId } });
    if (!movie)
        throw new Error("Movie not found");
    // Check if already in watchlist
    const existing = await prisma.watchlist.findFirst({
        where: { user_id: userId, movie_id: movieId },
    });
    if (existing) {
        throw new Error("Movie already in watchlist");
    }
    return prisma.watchlist.create({
        data: { user_id: userId, movie_id: movieId },
    });
};
export const removeFromWatchlist = async (userId, movieId) => {
    const watchlistItem = await prisma.watchlist.findFirst({
        where: { user_id: userId, movie_id: movieId },
    });
    if (!watchlistItem) {
        throw new Error("Movie not in watchlist");
    }
    await prisma.watchlist.delete({ where: { id: watchlistItem.id } });
    return true;
};
export const isInWatchlist = async (userId, movieId) => {
    const item = await prisma.watchlist.findFirst({
        where: { user_id: userId, movie_id: movieId },
    });
    return !!item;
};
