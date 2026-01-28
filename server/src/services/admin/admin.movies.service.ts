import prisma from "../../prisma/client.js";

interface MovieInput {
  title: string;
  description?: string;
  year?: number;
  duration?: number;
  poster?: string;
  trailer_url?: string;
  genreIds?: number[];
  castIds?: { personId: number; role?: string }[];
}

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const getAll = async (query: QueryParams) => {
  console.log("🔍 Admin getAll movies called with query:", query);

  const page = Math.max(1, Number(query.page || 1));
  const limit = Math.min(100, Number(query.limit || 10));
  const skip = (page - 1) * limit;
  const search = query.search ? String(query.search) : undefined;

  const where: any = {};
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
          // ❌ REMOVE: ratings include
        },
      }),
      prisma.movies.count({ where }),
    ]);

    console.log(`✅ Found ${movies.length} movies out of ${total} total`);

    // ⭐ Get ratings from movies_cleaned
    const movieIds = movies.map(m => m.id);
    let ratingsMap = new Map<number, { rating: number; rating_count: number }>();

    if (movieIds.length > 0) {
      const movieRatingsData = await prisma.$queryRawUnsafe<any[]>(
        `SELECT movie_id, rating, rating_count 
         FROM movies_cleaned 
         WHERE movie_id IN (${movieIds.join(',')})`
      );

      movieRatingsData.forEach(row => {
        ratingsMap.set(row.movie_id, {
          rating: row.rating || 0,
          rating_count: row.rating_count || 0,
        });
      });
    }

    // Map to proper format with ratings from movies_cleaned
    const data = movies.map((m) => {
      const ratingData = ratingsMap.get(m.id);
      const avgRating = ratingData?.rating || 0;

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        poster: m.poster,
        year: m.year,
        duration: m.duration,
        trailer_url: m.trailer_url,
        avgRating: Number(avgRating.toFixed(1)), // ⭐ From movies_cleaned
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
  } catch (error) {
    console.error("❌ Error in admin getAll movies:", error);
    throw new Error("Failed to fetch movies");
  }
};

export const getById = async (id: number) => {
  try {
    const movie = await prisma.movies.findUnique({
      where: { id },
      include: {
        movie_genres: { include: { genres: true } },
        movie_casts: { include: { people: true } },
      },
    });

    if (!movie) return null;

    return {
      ...movie,
      genres: movie.movie_genres.map((mg) => mg.genres),
      casts: movie.movie_casts.map((mc) => mc.people),
    };
  } catch (error) {
    console.error("❌ Error in admin getById movie:", error);
    throw new Error("Failed to fetch movie");
  }
};

export const create = async (input: MovieInput) => {
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
  } catch (error) {
    console.error("❌ Error in admin create movie:", error);
    throw new Error("Failed to create movie");
  }
};

export const update = async (id: number, input: MovieInput) => {
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
  } catch (error) {
    console.error("❌ Error in admin update movie:", error);
    throw new Error("Failed to update movie");
  }
};

export const remove = async (id: number) => {
  try {
    // Delete related data first
    await prisma.$transaction(async (tx) => {
      // ❌ REMOVE: Delete ratings (table doesn't exist)
      // await tx.ratings.deleteMany({ where: { movie_id: id } });

      // Delete movie_genres
      await tx.movie_genres.deleteMany({ where: { movie_id: id } });

      // Delete movie_casts
      await tx.movie_casts.deleteMany({ where: { movie_id: id } });

      // Delete users_data
      await tx.users_data.deleteMany({ where: { movie_id: id } });

      // Finally delete movie
      await tx.movies.delete({ where: { id } });
    });

    console.log("✅ Movie deleted:", id);
    return true;
  } catch (error) {
    console.error("❌ Error in admin remove movie:", error);
    throw new Error("Failed to delete movie");
  }
};