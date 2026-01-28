import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../prisma/client.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRecommendedMovies = async (userId: number) => {
  try {
    console.log("🎬 Starting recommendation for user ID:", userId);

    // Check if user has data
    const userDataCount = await prisma.users_data.count({
      where: { user_id: userId },
    });

    console.log(`📊 User ${userId} has ${userDataCount} activities in users_data`);

    if (userDataCount === 0) {
      console.warn(`⚠️ User ${userId} has no data. Returning empty recommendations.`);
      return [];
    }

    // Check if movies_sorted has data
    const moviesSortedCount = await prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*) as count FROM movies_sorted`
    );
    const moviesCount = moviesSortedCount[0]?.count || 0;

    console.log(`📊 movies_sorted has ${moviesCount} records`);

    if (moviesCount === 0) {
      throw new Error("movies_sorted table is empty. Please run sync first.");
    }

    // Calculate Python script path
    const projectRoot = path.resolve(__dirname, "..", "..", "..");
    const pythonScript = path.join(projectRoot, "rec_system", "MovieDude", "src", "main.py");

    console.log("📂 Project root:", projectRoot);
    console.log("🐍 Python script path:", pythonScript);
    console.log("📁 Script exists:", fs.existsSync(pythonScript));

    if (!fs.existsSync(pythonScript)) {
      throw new Error(`Python script not found at: ${pythonScript}`);
    }

    console.log("🚀 Spawning Python process...");
    
    const recommendationLimit = "50"; // Number of recommendations to return
    
    console.log("   Command: python");
    console.log("   Args:", [pythonScript, userId.toString(), recommendationLimit, "true"]);

    const pythonProcess = spawn("python", [
      pythonScript,
      userId.toString(),
      recommendationLimit,
      "true", // filter_watched
      "true", // ⭐ CHANGE: disable debug mode (was "true")
    ]);

    let output = "";
    let errorOutput = "";
    
    // ⭐ DECLARE variables here (before using them)
    let userGenres: string[] = [];
    let userKeywords: string[] = [];

    pythonProcess.stdout.on("data", (data) => {
      const chunk = data.toString();
      console.log("🐍 Python stdout:", chunk.trim());
      output += chunk;
    });

    pythonProcess.stderr.on("data", (data) => {
      const chunk = data.toString();
      
      // ⭐ Split by newlines to handle multiple debug messages in one chunk
      const lines = chunk.split(/\r?\n/);
      
      lines.forEach(line => {
        const trimmed = line.trim();
        
        if (!trimmed) return;
        
        // ⭐ Parse debug info
        if (trimmed.startsWith("DEBUG:USER_GENRES:")) {
          const genresStr = trimmed.replace("DEBUG:USER_GENRES:", "").trim();
          userGenres = genresStr ? genresStr.split(",").map(g => g.trim()) : [];
          console.log("🎭 User's favorite genres:", userGenres);
        } else if (trimmed.startsWith("DEBUG:USER_KEYWORDS:")) {
          const keywordsStr = trimmed.replace("DEBUG:USER_KEYWORDS:", "").trim();
          userKeywords = keywordsStr ? keywordsStr.split(",").map(k => k.trim()) : [];
          console.log("🔑 User's favorite keywords:", userKeywords);
        } else {
          // Log warnings but don't print to console (avoid spam)
          if (!trimmed.includes("UserWarning") && !trimmed.includes("pandas only supports")) {
            console.error("🐍 Python stderr:", trimmed);
          }
        }
      });
      
      errorOutput += chunk;
    });

    return new Promise((resolve, reject) => {
      pythonProcess.on("close", async (code) => {
        console.log(`🐍 Python process exited with code ${code}`);

        if (code !== 0) {
          console.error("❌ Python error output:", errorOutput);
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
          return;
        }

        // Parse output
        const lines = output.trim().split("\n");
        console.log(`📋 Python returned ${lines.length} lines`);

        // Extract movie titles (filter out ALL non-movie lines)
        const movieTitles = lines
          .filter((line) => {
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) return false;
            
            // Skip debug/error messages
            if (trimmed.startsWith("Running recommendation")) return false;
            if (trimmed.startsWith("Limit:")) return false;
            if (trimmed.startsWith("Filter watched:")) return false;
            if (trimmed.startsWith("Error:")) return false;
            if (trimmed.includes("Working...")) return false;
            if (trimmed.includes("✓")) return false;
            if (trimmed.includes("✅")) return false;
            if (trimmed.includes("❌")) return false;
            if (trimmed.includes("📋")) return false;
            if (trimmed.includes("Found")) return false;
            
            // Only lines that look like movie titles
            return true;
          })
          .map((line) => line.trim());

        console.log(`🎬 Extracted ${movieTitles.length} movie titles:`, movieTitles);

        if (movieTitles.length === 0) {
          console.warn("⚠️ No movie titles extracted from Python output");
          console.warn("Full output:", output);
          resolve([]);
          return;
        }

        // Fetch movie details
        try {
          const movies = await getMoviesByTitles(movieTitles);
          console.log(`✅ Returning ${movies.length} recommended movies`);
          resolve(movies);
        } catch (error: any) {
          console.error("❌ Error fetching movies by titles:", error);
          reject(error);
        }
      });

      pythonProcess.on("error", (error) => {
        console.error("❌ Failed to start Python process:", error);
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  } catch (error: any) {
    console.error("❌ Error in getRecommendedMovies:", error);
    throw error;
  }
};

export const getMoviesByTitles = async (titles: string[]) => {
  try {
    console.log(`🔍 Fetching ${titles.length} movies from database...`);

    if (titles.length === 0) {
      console.log("⚠️ No titles provided, returning empty array");
      return [];
    }

    // Query movies WITHOUT ratings
    const movies = await prisma.movies.findMany({
      where: {
        title: {
          in: titles,
        },
      },
      include: {
        movie_genres: {
          include: { genres: true },
        },
        movie_casts: {
          include: { people: true },
        },
      },
    });

    console.log(`✅ Found ${movies.length}/${titles.length} movies in database`);

    if (movies.length === 0) {
      console.warn("⚠️ No movies found for the given titles. Database might not have these movies.");
      return [];
    }

    // Get ratings from movies_cleaned
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

      console.log(`✅ Got ratings for ${movieRatingsData.length} movies from movies_cleaned`);
    }

    // Map movies with ratings from movies_cleaned
    const moviesWithRatings = movies.map((movie) => {
      const ratingData = ratingsMap.get(movie.id);
      const avgRating = ratingData?.rating || 0;
      const ratingsCount = ratingData?.rating_count || 0;

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
        })),
      };
    });

    // Sort movies to match the order from Python
    const sortedMovies = titles
      .map((title) => moviesWithRatings.find((m) => m.title === title))
      .filter((m): m is NonNullable<typeof m> => m !== undefined);

    console.log(`✅ Returning ${sortedMovies.length} sorted movies`);
    return sortedMovies;
  } catch (error: any) {
    console.error("❌ Error in getMoviesByTitles:", error);
    throw error;
  }
};