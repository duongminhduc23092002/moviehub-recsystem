import prisma from "../prisma/client.js";

export const getAll = async (query: any) => {
  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Number(query.limit || 24));
  const skip = (page - 1) * limit;
  const search = query.search ? String(query.search).trim() : undefined;
  const genre = query.genre ? String(query.genre).trim() : undefined;
  const sort = query.sort || 'latest';

  console.log("🔍 getAll movies with params:", { page, limit, search, genre, sort });

  // Build WHERE clause
  const where: any = {};
  
  // ⭐ Genre filter: Use contains WITHOUT mode (Prisma limitation)
  if (genre && genre !== 'all') {
    where.movie_genres = {
      some: {
        genres: {
          name: {
            contains: genre, // ✅ No mode on nested relations
          },
        },
      },
    };
    console.log("🎯 Filtering by genre (contains):", genre);
  }

  // Search filter (mode works on direct fields)
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
    console.log("🔍 Searching for:", search);
  }

  // Build ORDER BY clause
  let orderBy: any = { created_at: "desc" };

  switch (sort) {
    case 'rating':
      orderBy = { final_score: 'desc' };
      break;
    case 'title':
      orderBy = { title: 'asc' };
      break;
    case 'year':
      orderBy = { year: 'desc' };
      break;
  }

  console.log("📊 Order by:", orderBy);

  try {
    // Fetch movies
    const [movies, totalMovies] = await Promise.all([
      prisma.movies.findMany({
        where,
        skip,
        take: limit,
        orderBy,
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
        },
      }),
      prisma.movies.count({ where }),
    ]);

    console.log(`📊 Found ${movies.length} movies (total: ${totalMovies})`);

    if (movies.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          totalPages: 0,
        },
      };
    }

    // Get ratings from movies_cleaned
    const movieIds = movies.map(m => m.id);
    const movieRatingsData = await prisma.$queryRawUnsafe<any[]>(
      `SELECT movie_id, rating, rating_count FROM movies_cleaned WHERE movie_id IN (${movieIds.join(',')})`
    );

    const ratingsMap = new Map();
    movieRatingsData.forEach(r => {
      ratingsMap.set(r.movie_id, {
        rating: r.rating,
        rating_count: r.rating_count
      });
    });

    // Map movies with ratings
    const data = movies.map((movie) => {
      const ratingData = ratingsMap.get(movie.id);

      return {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        year: movie.year,
        duration: movie.duration,
        trailer_url: movie.trailer_url,
        avgRating: ratingData ? Number(ratingData.rating.toFixed(1)) : 0,
        ratingsCount: ratingData ? ratingData.rating_count : 0,
        genres: movie.movie_genres.map((mg) => ({
          id: mg.genres.id,
          name: mg.genres.name,
        })),
        casts: movie.movie_casts.map((mc) => ({
          id: mc.people.id,
          name: mc.people.name,
          role: mc.people.role,
          avatar: mc.people.avatar,
        })),
      };
    });

    const totalPages = Math.ceil(totalMovies / limit);

    return {
      data,
      meta: {
        total: totalMovies,
        page,
        totalPages,
      },
    };
  } catch (error: any) {
    console.error("❌ Error in getAll movies:", error);
    throw error;
  }
};

export const getById = async (id: number) => {
  try {
    const movie = await prisma.movies.findUnique({
      where: { id },
      include: {
        movie_genres: {
          include: { genres: true },
        },
        movie_casts: {
          include: { people: true },
        },
        // ❌ DELETE: Không query ratings nữa
        // ratings: {
        //   include: { users: { select: { id: true, name: true } } },
        //   orderBy: { created_at: "desc" },
        // },
      },
    });

    if (!movie) return null;

    // ⭐ Lấy rating từ movies_cleaned
    const movieCleaned = await prisma.$queryRawUnsafe<any[]>(
      `SELECT rating, rating_count FROM movies_cleaned WHERE movie_id = ?`,
      id
    );

    const avgRating = movieCleaned[0]?.rating || 0;
    const ratingsCount = movieCleaned[0]?.rating_count || 0;

    console.log(`📊 Movie ${id} - Rating: ${avgRating}, Count: ${ratingsCount} (from movies_cleaned)`);

    return {
      id: movie.id,
      title: movie.title,
      description: movie.description,
      poster: movie.poster,
      year: movie.year,
      duration: movie.duration,
      trailer_url: movie.trailer_url,
      avgRating: Number(avgRating.toFixed(1)),
      ratingsCount: ratingsCount,
      genres: movie.movie_genres.map((mg) => ({
        id: mg.genres.id,
        name: mg.genres.name,
      })),
      casts: movie.movie_casts.map((mc) => ({
        id: mc.people.id,
        name: mc.people.name,
        role: mc.people.role,
        avatar: mc.people.avatar,
      })),
      // ❌ DELETE: Không return ratings array
      // ratings: [],
    };
  } catch (error) {
    console.error("❌ Error in getById movie:", error);
    throw error;
  }
};

// ❌ DELETE: Xóa hàm getRatings (không dùng nữa)
// export const getRatings = async (movieId: number) => { ... }

// ❌ DELETE: Xóa hàm rateMovie (không dùng nữa)
// export const rateMovie = async (data: { ... }) => { ... }

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
    // const ratings = await prisma.ratings.findMany({
    //   where: { user_id: userId },
    //   select: { movie_id: true, score: true },
    // });

    // Lấy watchlist của user
    // const watchlist = await prisma.watchlist.findMany({
    //   where: { user_id: userId },
    //   select: { movie_id: true },
    // });

    // const watchlistMovieIds = new Set(watchlist.map(w => w.movie_id));

    // // Insert vào users_data
    // for (const rating of ratings) {
    //   const isLiked = watchlistMovieIds.has(rating.movie_id);
      
    //   await prisma.$executeRawUnsafe(
    //     `INSERT INTO users_data (user_id, movie_id, user_rate, liked) VALUES (?, ?, ?, ?)`,
    //     user.id,
    //     rating.movie_id,
    //     rating.score || 0,
    //     isLiked ? 1 : 0
    //   );
    // }

    // // Thêm các phim trong watchlist mà chưa có rating
    // for (const item of watchlist) {
    //   const hasRating = ratings.some(r => r.movie_id === item.movie_id);
    //   if (!hasRating) {
    //     await prisma.$executeRawUnsafe(
    //       `INSERT INTO users_data (user_id, movie_id, user_rate, liked) VALUES (?, ?, ?, ?)`,
    //       user.email,
    //       item.movie_id,
    //       5.0, // Default rating cho watchlist items
    //       1
    //     );
    //   }
    // }

    console.log(`✅ Synced 0 ratings + 0 watchlist items`);
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
        // ❌ REMOVE: ratings include
        // ratings: {
        //   select: { score: true },
        // },
      },
    });

    for (const movie of movies) {
      // ⭐ Tính final_score từ movies_cleaned thay vì ratings
      const movieCleaned = await prisma.$queryRawUnsafe<any[]>(
        `SELECT rating FROM movies_cleaned WHERE movie_id = ?`,
        movie.id
      );
      
      const avgRating = movieCleaned[0]?.rating || 0;

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

/**
 * Get top 10 movies by final_score from movies table
 * ⭐ Lấy trực tiếp từ bảng movies (có cột final_score)
 */
export const getTopRatedMovies = async (limit: number = 10) => {
  try {
    console.log(`🏆 Fetching top ${limit} movies by final_score from movies table...`);

    // ⭐ Query trực tiếp từ bảng movies
    const topMovies = await prisma.movies.findMany({
      where: {
        final_score: {
          not: null,
          gt: 0, // Only movies with final_score > 0
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
      },
      orderBy: {
        final_score: 'desc', // ⭐ Sort by final_score DESC
      },
      take: limit, // ⭐ Limit results
    });

    if (topMovies.length === 0) {
      console.warn("⚠️ No movies with final_score found in movies table");
      return [];
    }

    console.log(`✅ Found ${topMovies.length} top movies by final_score`);

    // ⭐ Get ratings from movies_cleaned for display
    const movieIds = topMovies.map(m => m.id);
    const movieRatingsData = await prisma.$queryRawUnsafe<any[]>(
      `SELECT movie_id, rating, rating_count 
       FROM movies_cleaned 
       WHERE movie_id IN (${movieIds.join(',')})` 
    );

    const ratingsMap = new Map<number, { rating: number; rating_count: number }>();
    movieRatingsData.forEach(row => {
      ratingsMap.set(row.movie_id, {
        rating: row.rating || 0,
        rating_count: row.rating_count || 0,
      });
    });

    // ⭐ Map to response format
    const result = topMovies.map((movie) => {
      const ratingData = ratingsMap.get(movie.id);

      return {
        id: movie.id,
        title: movie.title,
        description: movie.description,
        poster: movie.poster,
        year: movie.year,
        duration: movie.duration,
        trailer_url: movie.trailer_url,
        avgRating: ratingData ? Number(ratingData.rating.toFixed(1)) : 0,       // From movies_cleaned
        ratingsCount: ratingData ? ratingData.rating_count : 0,                 // From movies_cleaned
        finalScore: movie.final_score ? Number(movie.final_score.toFixed(2)) : 0, // ⭐ From movies table
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

    console.log(`✅ Returning ${result.length} top movies`);
    if (result.length > 0) {
      console.log(`📊 #1: ${result[0].title} (Final Score: ${result[0].finalScore}, Rating: ${result[0].avgRating})`);
    }

    return result;
  } catch (error) {
    console.error("❌ Error in getTopRatedMovies:", error);
    throw error;
  }
};

/**
 * Đánh giá phim và thêm comment
 */
export const rateMovie = async (data: {
  userId: number;
  movieId: number;
  rating: number; // 1-10
  comment?: string;
}) => {
  try {
    console.log(`⭐ Rating movie ${data.movieId} by user ${data.userId}`);
    console.log(`   Rating: ${data.rating}/10`);
    console.log(`   Comment: ${data.comment || 'No comment'}`);

    // Validate rating
    if (data.rating < 1 || data.rating > 10) {
      throw new Error("Rating must be between 1 and 10");
    }

    // ⭐ Verify user exists
    const user = await prisma.users.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // ⭐ Verify movie exists
    const movie = await prisma.movies.findUnique({
      where: { id: data.movieId },
    });

    if (!movie) {
      throw new Error("Movie not found");
    }

    // Check if user already rated
    const existing = await prisma.users_data.findUnique({
      where: {
        movie_id_user_id: {
          movie_id: data.movieId,
          user_id: data.userId,
        },
      },
    });

    if (existing) {
      // Update existing rating
      const updated = await prisma.users_data.update({
        where: {
          movie_id_user_id: {
            movie_id: data.movieId,
            user_id: data.userId,
          },
        },
        data: {
          user_rate: data.rating,
          comments: data.comment || null,
        },
      });

      console.log(`✅ Updated rating for movie ${data.movieId}`);
      return updated;
    } else {
      // Create new rating
      const created = await prisma.users_data.create({
        data: {
          user_id: data.userId,
          movie_id: data.movieId,
          user_rate: data.rating,
          comments: data.comment || null,
          liked: false,
        },
      });

      console.log(`✅ Created new rating for movie ${data.movieId}`);
      return created;
    }
  } catch (error: any) {
    console.error("❌ Error in rateMovie:", error);
    console.error("   Error code:", error.code); // Prisma error code
    console.error("   Error meta:", error.meta); // Additional info
    throw error;
  }
};

/**
 * Lấy tất cả ratings và comments của một phim
 */
export const getMovieRatings = async (movieId: number) => {
  try {
    console.log(`📋 Getting ratings for movie ${movieId}`);

    const ratings = await prisma.users_data.findMany({
      where: {
        movie_id: movieId,
        user_rate: {
          not: null,
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        movie_id: 'desc', // Latest first
      },
    });

    console.log(`✅ Found ${ratings.length} ratings for movie ${movieId}`);

    return ratings.map((r) => ({
      id: `${r.movie_id}_${r.user_id}`, // Composite ID
      userId: r.user_id,
      userName: r.users.name,
      rating: r.user_rate || 0,
      comment: r.comments,
      createdAt: new Date(), // users_data doesn't have timestamp, use current
    }));
  } catch (error: any) {
    console.error("❌ Error in getMovieRatings:", error);
    throw error;
  }
};

/**
 * Lấy rating của user cho một phim cụ thể
 */
export const getUserRatingForMovie = async (userId: number, movieId: number) => {
  try {
    const rating = await prisma.users_data.findUnique({
      where: {
        movie_id_user_id: {
          movie_id: movieId,
          user_id: userId,
        },
      },
    });

    if (!rating || !rating.user_rate) {
      return null;
    }

    return {
      rating: rating.user_rate,
      comment: rating.comments,
    };
  } catch (error: any) {
    console.error("❌ Error in getUserRatingForMovie:", error);
    throw error;
  }
};

/**
 * Xóa rating/comment của user
 */
export const deleteRating = async (userId: number, movieId: number) => {
  try {
    console.log(`🗑️ Deleting rating for movie ${movieId} by user ${userId}`);

    const existing = await prisma.users_data.findUnique({
      where: {
        movie_id_user_id: {
          movie_id: movieId,
          user_id: userId,
        },
      },
    });

    if (!existing) {
      throw new Error("Rating not found");
    }

    // If user also liked the movie, just remove rating/comment, keep liked
    if (existing.liked) {
      await prisma.users_data.update({
        where: {
          movie_id_user_id: {
            movie_id: movieId,
            user_id: userId,
          },
        },
        data: {
          user_rate: null,
          comments: null,
        },
      });
      console.log(`✅ Removed rating but kept liked status`);
    } else {
      // If not liked, delete entire record
      await prisma.users_data.delete({
        where: {
          movie_id_user_id: {
            movie_id: movieId,
            user_id: userId,
          },
        },
      });
      console.log(`✅ Deleted rating record`);
    }

    return true;
  } catch (error: any) {
    console.error("❌ Error in deleteRating:", error);
    throw error;
  }
};

/**
 * ⭐ Lấy tất cả genres với số lượng phim
 */
export const getAllGenres = async () => {
  try {
    const genres = await prisma.genres.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            movie_genres: true,
          },
        },
      },
    });

    // Map to include moviesCount
    return genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
      moviesCount: genre._count.movie_genres,
    }));
  } catch (error) {
    console.error("❌ Error in getAllGenres:", error);
    throw error;
  }
};
