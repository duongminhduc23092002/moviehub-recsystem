import prisma from "../prisma/client.js";
export const getAll = async (query) => {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.min(100, Number(query.limit || 24));
    const skip = (page - 1) * limit;
    const search = query.search ? String(query.search).trim() : undefined;
    const genre = query.genre ? String(query.genre).trim() : undefined;
    const sort = query.sort || 'latest'; // ⭐ Get sort param
    // Build WHERE clause
    const where = {};
    // Genre filter first (more efficient)
    if (genre && genre !== 'all') {
        where.movie_genres = {
            some: {
                genres: {
                    name: {
                        contains: genre,
                    },
                },
            },
        };
    }
    // ⭐ Build ORDER BY clause based on sort param
    let orderBy = { created_at: "desc" }; // Default: latest
    switch (sort) {
        case 'rating':
            // Sort by average rating (calculated from ratings)
            // We'll do this in-memory after fetching
            orderBy = { created_at: "desc" }; // Fetch all first
            break;
        case 'title':
            orderBy = { title: "asc" }; // A-Z
            break;
        case 'year':
            orderBy = { year: "desc" }; // Newest year first
            break;
        case 'latest':
        default:
            orderBy = { created_at: "desc" };
            break;
    }
    // Fetch movies with optional genre filter
    const allMovies = await prisma.movies.findMany({
        where,
        include: {
            movie_genres: {
                include: {
                    genres: true,
                },
            },
            movie_casts: {
                include: {
                    people: true,
                },
            },
            ratings: {
                select: {
                    score: true,
                },
            },
        },
        orderBy,
    });
    // Client-side case-insensitive search (works with all databases)
    let filteredMovies = allMovies;
    if (search) {
        const searchLower = search.toLowerCase();
        filteredMovies = allMovies.filter((movie) => {
            const titleMatch = movie.title?.toLowerCase().includes(searchLower);
            const descMatch = movie.description?.toLowerCase().includes(searchLower);
            return titleMatch || descMatch;
        });
    }
    // ⭐ Calculate avgRating for each movie and sort by rating if needed
    const moviesWithRatings = filteredMovies.map((movie) => {
        const ratings = movie.ratings || [];
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;
        return {
            id: movie.id,
            title: movie.title,
            description: movie.description,
            poster: movie.poster,
            year: movie.year,
            duration: movie.duration,
            trailer_url: movie.trailer_url,
            created_at: movie.created_at,
            avgRating: Number(avgRating.toFixed(1)),
            genres: movie.movie_genres.map((mg) => ({
                id: mg.genres.id,
                name: mg.genres.name,
            })),
            casts: movie.movie_casts.map((mc) => ({
                id: mc.people.id,
                name: mc.people.name,
                role: mc.people.role,
            })),
        };
    });
    // ⭐ Sort by rating if needed (in-memory)
    if (sort === 'rating') {
        moviesWithRatings.sort((a, b) => b.avgRating - a.avgRating);
    }
    const total = moviesWithRatings.length;
    const paginatedMovies = moviesWithRatings.slice(skip, skip + limit);
    return {
        data: paginatedMovies,
        meta: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit,
        },
    };
};
export const getById = async (id) => {
    const movie = await prisma.movies.findUnique({
        where: { id },
        include: {
            movie_genres: {
                include: { genres: true },
            },
            movie_casts: {
                include: { people: true },
            },
            ratings: {
                include: {
                    users: {
                        select: { id: true, name: true },
                    },
                },
                orderBy: { created_at: "desc" },
            },
        },
    });
    if (!movie)
        return null;
    // Calculate average rating
    const ratings = movie.ratings || [];
    const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : 0;
    return {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        year: movie.year,
        duration: movie.duration,
        trailer_url: movie.trailer_url,
        avgRating: Number(avgRating.toFixed(1)),
        genres: movie.movie_genres.map((mg) => ({
            id: mg.genres.id,
            name: mg.genres.name,
        })),
        casts: movie.movie_casts.map((mc) => ({
            id: mc.people.id,
            name: mc.people.name,
            avatar: mc.people.avatar,
            role: mc.people.role,
        })),
        ratings: movie.ratings.map((r) => ({
            id: r.id,
            score: r.score,
            comment: r.comment,
            created_at: r.created_at,
            users: r.users,
        })),
    };
};
export const getRatings = async (movieId) => {
    const ratings = await prisma.ratings.findMany({
        where: { movie_id: movieId },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: { created_at: "desc" },
    });
    return ratings.map((r) => ({
        id: r.id,
        score: r.score,
        comment: r.comment,
        created_at: r.created_at,
        user: r.users,
    }));
};
export const rateMovie = async (data) => {
    const { userId, movieId, score, comment } = data;
    // Check if user already rated this movie
    const existingRating = await prisma.ratings.findFirst({
        where: {
            user_id: userId,
            movie_id: movieId,
        },
    });
    let rating;
    if (existingRating) {
        // Update existing rating
        rating = await prisma.ratings.update({
            where: { id: existingRating.id },
            data: {
                score,
                comment: comment || null,
            },
            include: {
                users: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    else {
        // Create new rating
        rating = await prisma.ratings.create({
            data: {
                user_id: userId,
                movie_id: movieId,
                score,
                comment: comment || null,
            },
            include: {
                users: {
                    select: { id: true, name: true },
                },
            },
        });
    }
    return {
        id: rating.id,
        score: rating.score,
        comment: rating.comment,
        created_at: rating.created_at,
        users: rating.users,
    };
};
export const getTopRatedMovies = async (limit = 10) => {
    // Fetch all movies with their ratings
    const movies = await prisma.movies.findMany({
        include: {
            movie_genres: {
                include: {
                    genres: true,
                },
            },
            movie_casts: {
                include: {
                    people: true,
                },
            },
            ratings: {
                select: {
                    score: true,
                },
            },
        },
    });
    // Calculate average rating for each movie
    const moviesWithAvgRating = movies.map((movie) => {
        const ratings = movie.ratings || [];
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;
        return {
            id: movie.id,
            title: movie.title,
            description: movie.description,
            poster: movie.poster,
            year: movie.year,
            duration: movie.duration,
            trailer_url: movie.trailer_url,
            avgRating: Number(avgRating.toFixed(1)),
            ratingsCount: ratings.length,
            genres: movie.movie_genres.map((mg) => ({
                id: mg.genres.id,
                name: mg.genres.name,
            })),
            casts: movie.movie_casts.map((mc) => ({
                id: mc.people.id,
                name: mc.people.name,
                role: mc.people.role,
            })),
        };
    });
    // Filter movies with rating >= 4.5 and at least 1 rating
    const topRated = moviesWithAvgRating
        .filter((m) => m.avgRating >= 4.5 && m.ratingsCount > 0)
        .sort((a, b) => {
        // Sort by avgRating DESC, then by ratingsCount DESC
        if (b.avgRating !== a.avgRating) {
            return b.avgRating - a.avgRating;
        }
        return b.ratingsCount - a.ratingsCount;
    })
        .slice(0, limit);
    return topRated;
};
