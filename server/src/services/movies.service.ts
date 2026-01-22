import prisma from "../prisma/client.js";

export const getAll = async (query: any) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Number(query.limit || 24));
  const skip = (page - 1) * limit;
  const search = query.search ? String(query.search).trim() : undefined;
  const genre = query.genre ? String(query.genre).trim() : undefined;
  const sort = query.sort || 'latest'; // ⭐ Get sort param

  // Build WHERE clause
  const where: any = {};
  
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
  let orderBy: any = { created_at: "desc" }; // Default: latest

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

export const getById = async (id: number) => {
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

  if (!movie) return null;

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

export const getRatings = async (movieId: number) => {
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

export const rateMovie = async (data: {
  userId: number;
  movieId: number;
  score: number;
  comment?: string;
}) => {
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
  } else {
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
  
  // ⭐ THÊM DÒNG NÀY: Sync sau khi rate
  try {
    await syncUsersData(userId);
    console.log(`✅ Synced users_data for user ${userId} after rating`);
  } catch (error) {
    console.error(`⚠️ Failed to sync users_data for user ${userId}:`, error);
    // Không throw error để không ảnh hưởng đến rating
  }
  
  return {
    id: rating.id,
    score: rating.score,
    comment: rating.comment,
    created_at: rating.created_at,
    users: rating.users,
  };
};

/**
 * Đồng bộ dữ liệu từ ratings và watchlist sang users_data
 * để Python recommendation engine có thể sử dụng
 */
export const syncUsersData = async (userId: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) return;

    console.log(`🔄 Syncing users_data for ${user.email}...`);

    // Xóa dữ liệu cũ
    await prisma.$executeRawUnsafe(
      `DELETE FROM users_data WHERE user_id = ?`,
      user.email
    );

    // Lấy ratings của user
    const ratings = await prisma.ratings.findMany({
      where: { user_id: userId },
      select: { movie_id: true, score: true },
    });

    // Lấy watchlist của user
    const watchlist = await prisma.watchlist.findMany({
      where: { user_id: userId },
      select: { movie_id: true },
    });

    const watchlistMovieIds = new Set(watchlist.map(w => w.movie_id));

    // Insert vào users_data
    for (const rating of ratings) {
      const isLiked = watchlistMovieIds.has(rating.movie_id);
      
      await prisma.$executeRawUnsafe(
        `INSERT INTO users_data (user_id, movie_id, user_rate, liked) VALUES (?, ?, ?, ?)`,
        user.email,
        rating.movie_id,
        rating.score || 0,
        isLiked ? 1 : 0
      );
    }

    // Thêm các phim trong watchlist mà chưa có rating
    for (const item of watchlist) {
      const hasRating = ratings.some(r => r.movie_id === item.movie_id);
      if (!hasRating) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO users_data (user_id, movie_id, user_rate, liked) VALUES (?, ?, ?, ?)`,
          user.email,
          item.movie_id,
          5.0, // Default rating cho watchlist items
          1
        );
      }
    }

    console.log(`✅ Synced ${ratings.length} ratings + ${watchlist.length} watchlist items`);
  } catch (error) {
    console.error("❌ Error syncing users_data:", error);
  }
};

/**
 * Đồng bộ movies sang movies_sorted
 */
export const syncMoviesSorted = async () => {
  try {
    console.log("🔄 Syncing movies_sorted...");

    // Lấy tất cả phim với genres
    const movies = await prisma.movies.findMany({
      include: {
        movie_genres: {
          include: { genres: true },
        },
        ratings: {
          select: { score: true },
        },
      },
    });

    for (const movie of movies) {
      // Tính final_score (average rating)
      const ratings = movie.ratings.filter(r => r.score !== null);
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score!, 0) / ratings.length
        : 0;

      // Genres as comma-separated string
      const genres = movie.movie_genres
        .map(mg => mg.genres.name.toLowerCase())
        .join(", ");

      // Check if exists
      const existing = await prisma.$queryRawUnsafe(
        `SELECT movie_id FROM movies_sorted WHERE movie_id = ?`,
        movie.id
      ) as any[];

      if (existing.length > 0) {
        // Update
        await prisma.$executeRawUnsafe(
          `UPDATE movies_sorted SET title = ?, genres = ?, final_score = ? WHERE movie_id = ?`,
          movie.title,
          genres || null,
          avgRating,
          movie.id
        );
      } else {
        // Insert
        await prisma.$executeRawUnsafe(
          `INSERT INTO movies_sorted (movie_id, title, genres, keywords, final_score) VALUES (?, ?, ?, ?, ?)`,
          movie.id,
          movie.title,
          genres || null,
          null, // keywords TODO: extract from description
          avgRating
        );
      }
    }

    console.log(`✅ Synced ${movies.length} movies to movies_sorted`);
  } catch (error) {
    console.error("❌ Error syncing movies_sorted:", error);
  }
};

/**
 * Full sync - chạy khi khởi động server
 */
export const fullSync = async () => {
  console.log("🔄 Starting full recommendation data sync...");
  
  await syncMoviesSorted();
  
  // Sync cho tất cả users
  const users = await prisma.users.findMany({
    select: { id: true },
  });

  for (const user of users) {
    await syncUsersData(user.id);
  }

  console.log("✅ Full sync completed");
};

// ...existing code...

export const getTopRatedMovies = async (limit: number = 10) => {
  try {
    // Fetch movies với final_score cao nhất từ bảng movies
    const movies = await prisma.movies.findMany({
      where: {
        final_score: {
          not: null,
          gt: 0, // Chỉ lấy phim có final_score > 0
        },
      },
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
      orderBy: {
        final_score: 'desc', // Sắp xếp theo final_score giảm dần
      },
      take: limit,
    });

    // Map to proper format
    const topRated = movies.map((movie) => {
      const ratings = movie.ratings || [];
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : movie.final_score || 0;

      return {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        year: movie.year,
        duration: movie.duration,
        trailer_url: movie.trailer_url,
        avgRating: Number(avgRating.toFixed(1)),
        finalScore: Number((movie.final_score || 0).toFixed(2)),
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

    console.log(`✅ Returning top ${topRated.length} movies by final_score`);
    return topRated;
  } catch (error) {
    console.error("❌ Error in getTopRatedMovies:", error);
    throw error;
  }
};
