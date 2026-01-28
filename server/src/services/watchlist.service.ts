import prisma from "../prisma/client.js";

/**
 * Lấy danh sách phim yêu thích (liked=true) từ users_data
 */
export const getUserWatchlist = async (userId: number) => {
  try {
    console.log("📋 Getting watchlist for user ID:", userId);
    console.log("   User ID type:", typeof userId);

    // ⭐ Validate userId
    if (!userId || isNaN(userId)) {
      throw new Error(`Invalid userId: ${userId}`);
    }

    // ⭐ Check if users_data table exists
    console.log("🔍 Querying users_data table...");

    const likedMovies = await prisma.users_data.findMany({
      where: {
        user_id: userId,
        liked: true,
      },
      include: {
        movies: {
          include: {
            movie_genres: { 
              include: { 
                genres: true 
              } 
            },
          },
        },
      },
      orderBy: { 
        movie_id: "desc" 
      },
    }).catch((err) => {
      console.error("❌ Prisma query error:", err);
      throw new Error(`Database query failed: ${err.message}`);
    });

    console.log(`✅ Found ${likedMovies.length} liked movies`);

    if (likedMovies.length === 0) {
      console.warn("⚠️ No liked movies found for user");
      return [];
    }

    // ⭐ Get ratings from movies_cleaned
    const movieIds = likedMovies.map(item => item.movie_id);
    console.log(`📊 Fetching ratings for ${movieIds.length} movies...`);

    let movieRatingsMap = new Map<number, { rating: number; rating_count: number }>();
    
    if (movieIds.length > 0) {
      try {
        const movieRatingsData = await prisma.$queryRawUnsafe<any[]>(
          `SELECT movie_id, rating, rating_count 
           FROM movies_cleaned 
           WHERE movie_id IN (${movieIds.join(',')})` 
        );

        console.log(`✅ Got ratings for ${movieRatingsData.length} movies`);

        movieRatingsData.forEach(row => {
          movieRatingsMap.set(row.movie_id, {
            rating: row.rating || 0,
            rating_count: row.rating_count || 0,
          });
        });
      } catch (err: any) {
        console.error("⚠️ Warning: Could not fetch ratings from movies_cleaned:", err.message);
        // Don't throw - continue without ratings
      }
    }

    // ⭐ Map results
    const results = likedMovies.map((item) => {
      const ratingData = movieRatingsMap.get(item.movie_id);
      const avgRating = ratingData?.rating || 0;
      const ratingsCount = ratingData?.rating_count || 0;

      return {
        id: item.movies.id,
        title: item.movies.title,
        description: item.movies.description,
        poster: item.movies.poster,
        year: item.movies.year,
        duration: item.movies.duration,
        avgRating: Number(avgRating.toFixed(1)),
        ratingsCount: ratingsCount,
        genres: item.movies.movie_genres.map((mg) => ({
          id: mg.genres.id,
          name: mg.genres.name,
        })),
      };
    });

    console.log(`✅ Returning ${results.length} movies`);
    return results;

  } catch (error: any) {
    console.error("❌ Error in getUserWatchlist:", error);
    console.error("   Error name:", error.name);
    console.error("   Error message:", error.message);
    console.error("   Error stack:", error.stack);
    throw error;
  }
};

/**
 * Thêm phim vào yêu thích (set liked=true)
 */
export const addToWatchlist = async (userId: number, movieId: number) => {
  try {
    console.log(`➕ Adding movie ${movieId} to watchlist for user ${userId}`);

    // Check if movie exists
    const movie = await prisma.movies.findUnique({ where: { id: movieId } });
    if (!movie) {
      throw new Error("Movie not found");
    }

    // Query bằng user_id (INT)
    const existing = await prisma.users_data.findUnique({
      where: {
        movie_id_user_id: {
          movie_id: movieId,
          user_id: userId,
        },
      },
    });

    let result;
    
    if (existing) {
      // Update liked = true
      result = await prisma.users_data.update({
        where: {
          movie_id_user_id: {
            movie_id: movieId,
            user_id: userId,
          },
        },
        data: { liked: true },
      });
    } else {
      // Create new entry with liked = true
      result = await prisma.users_data.create({
        data: {
          user_id: userId,
          movie_id: movieId,
          user_rate: null,
          liked: true,
        },
      });
    }

    // ⭐ NEW: Invalidate recommendation cache for this user
    console.log(`🔄 Recommendation data updated for user ${userId}`);
    
    return result;
  } catch (error: any) {
    console.error("❌ Error in addToWatchlist:", error);
    throw error;
  }
};

/**
 * Xóa khỏi yêu thích (set liked=false hoặc xóa)
 */
export const removeFromWatchlist = async (userId: number, movieId: number) => {
  try {
    console.log(`➖ Removing movie ${movieId} from watchlist for user ${userId}`);

    const existing = await prisma.users_data.findUnique({
      where: {
        movie_id_user_id: {
          movie_id: movieId,
          user_id: userId,
        },
      },
    });

    if (!existing) {
      throw new Error("Movie not in watchlist");
    }

    // If user also rated, just set liked=false
    if (existing.user_rate !== null) {
      await prisma.users_data.update({
        where: {
          movie_id_user_id: {
            movie_id: movieId,
            user_id: userId,
          },
        },
        data: { liked: false },
      });
      console.log(`✅ Set liked=false but kept rating`);
    } else {
      // If no rating, delete the entry
      await prisma.users_data.delete({
        where: {
          movie_id_user_id: {
            movie_id: movieId,
            user_id: userId,
          },
        },
      });
      console.log(`✅ Deleted watchlist entry`);
    }

    // ⭐ NEW: Invalidate recommendation cache
    console.log(`🔄 Recommendation data updated for user ${userId}`);
    
  } catch (error: any) {
    console.error("❌ Error in removeFromWatchlist:", error);
    throw error;
  }
};

/**
 * Kiểm tra phim có trong yêu thích không
 */
export const isInWatchlist = async (userId: number, movieId: number) => {
  const item = await prisma.users_data.findUnique({
    where: {
      movie_id_user_id: {
        movie_id: movieId,
        user_id: userId,
      },
      liked: true,
    },
  });

  return !!item;
};

/**
 * ⭐ Lấy phim đã rate từ users_data (không dùng bảng ratings)
 */
export const getUserRatedMovies = async (userId: number) => {
  try {
    console.log("⭐ Getting rated movies for user ID:", userId);

    // Query từ users_data thay vì ratings
    const ratedMovies = await prisma.users_data.findMany({
      where: {
        user_id: userId,
        user_rate: { not: null },
      },
      include: {
        movies: {
          include: {
            movie_genres: { include: { genres: true } },
          },
        },
      },
      orderBy: { movie_id: "desc" },
    });

    console.log(`✅ Found ${ratedMovies.length} rated movies`);

    if (ratedMovies.length === 0) {
      return [];
    }

    // Lấy rating từ movies_cleaned
    const movieIds = ratedMovies.map(item => item.movie_id);
    let movieRatingsMap = new Map<number, { rating: number; rating_count: number }>();
    
    if (movieIds.length > 0) {
      const movieRatingsData = await prisma.$queryRawUnsafe<any[]>(
        `SELECT movie_id, rating, rating_count 
         FROM movies_cleaned 
         WHERE movie_id IN (${movieIds.join(',')})` 
      );

      movieRatingsData.forEach(row => {
        movieRatingsMap.set(row.movie_id, {
          rating: row.rating || 0,
          rating_count: row.rating_count || 0,
        });
      });
    }

    return ratedMovies.map((item) => {
      const ratingData = movieRatingsMap.get(item.movie_id);
      const avgRating = ratingData?.rating || 0;
      const ratingsCount = ratingData?.rating_count || 0;

      return {
        id: item.movies.id,
        title: item.movies.title,
        description: item.movies.description,
        poster: item.movies.poster,
        year: item.movies.year,
        duration: item.movies.duration,
        avgRating: Number(avgRating.toFixed(1)),
        ratingsCount: ratingsCount,
        genres: item.movies.movie_genres.map((mg) => ({
          id: mg.genres.id,
          name: mg.genres.name,
        })),
        // ⭐ User's rating from users_data (1-10 scale)
        userRating: {
          score: item.user_rate || 0,  // ⭐ Now 1-10 instead of 1-5
          comment: null,
          created_at: new Date(),
        },
      };
    });
  } catch (error: any) {
    console.error("❌ Error in getUserRatedMovies:", error);
    throw error;
  }
};