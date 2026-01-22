import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../prisma/client.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRecommendedMovies = async (userId: number) => {
  try {
    console.log("🎬 Starting recommendation for user:", userId);

    // Get user email
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    console.log("✅ Found user:", user.email);

    // Calculate Python script path
    const projectRoot = path.resolve(__dirname, "..", "..", "..");
    const pythonScript = path.join(projectRoot, "rec_system", "MovieDude", "src", "main.py");

    console.log("📂 Project root:", projectRoot);
    console.log("🐍 Python script path:", pythonScript);
    console.log("📁 Script exists:", fs.existsSync(pythonScript));

    // Check if Python script exists
    if (!fs.existsSync(pythonScript)) {
      throw new Error(`Python script not found at: ${pythonScript}`);
    }

    console.log("🚀 Spawning Python process...");
    console.log("   Command: python");
    console.log("   Args:", [pythonScript, user.email, "1"]);

    return new Promise<string[]>((resolve, reject) => {
      const pythonProcess = spawn("python", [pythonScript, user.email, "1"]);

      let output = "";
      let errorOutput = "";
      let hasStarted = false;

      pythonProcess.stdout.on("data", (data) => {
        hasStarted = true;
        const text = data.toString();
        console.log("🐍 [STDOUT]:", text);
        output += text;
      });

      pythonProcess.stderr.on("data", (data) => {
        const text = data.toString();
        console.error("🐍 [STDERR]:", text);
        errorOutput += text;
      });

      pythonProcess.on("error", (error) => {
        console.error("❌ Failed to start Python process:", error);
        reject(new Error(`Failed to start Python: ${error.message}. Make sure Python is installed and in PATH.`));
      });

      pythonProcess.on("close", (code) => {
        console.log(`🐍 Python process exited with code: ${code}`);

        if (!hasStarted) {
          reject(new Error("Python process failed to start. Check if 'python' command is available."));
          return;
        }

        if (code !== 0) {
          console.error("❌ Python script failed with error:", errorOutput);
          reject(new Error(`Python script exited with code ${code}: ${errorOutput || "Unknown error"}`));
          return;
        }

        try {
          console.log("📝 Parsing Python output...");
          console.log("📄 Full output:", output);

          const lines = output.split("\n");
          const movieTitles: string[] = [];
          
          let isRecommendationSection = false;
          for (const line of lines) {
            // Remove ANSI color codes
            const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
            
            // Look for recommendation section marker
            if (cleanLine.includes("Top 10 Recommended") || cleanLine.includes("Similar Movies")) {
              isRecommendationSection = true;
              console.log("✅ Found recommendation section:", cleanLine);
              continue;
            }
            
            // Parse numbered lines like "1. Movie Title" (more flexible regex)
            if (isRecommendationSection) {
              // Match lines starting with number followed by dot and space
              const match = cleanLine.match(/^(\d+)\.\s+(.+)$/);
              if (match && match[2]) {
                const title = match[2].trim();
                if (title) {
                  movieTitles.push(title);
                  console.log(`   ✓ Extracted: "${title}"`);
                }
              }
            }
          }

          console.log(`✅ Extracted ${movieTitles.length} movie titles:`, movieTitles);

          // If no titles found with section marker, try parsing all numbered lines
          if (movieTitles.length === 0) {
            console.log("⚠️ No section marker found, trying to parse all numbered lines...");
            for (const line of lines) {
              const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '').trim();
              const match = cleanLine.match(/^(\d+)\.\s+(.+)$/);
              if (match && match[2]) {
                const title = match[2].trim();
                if (title && !title.includes("Discover") && !title.includes("Find Similar")) {
                  movieTitles.push(title);
                  console.log(`   ✓ Extracted (fallback): "${title}"`);
                }
              }
            }
            console.log(`✅ Fallback extracted ${movieTitles.length} movie titles`);
          }

          if (movieTitles.length === 0) {
            console.warn("⚠️ No movie titles found in output. User might not have enough data.");
            // Return empty array instead of error
            resolve([]);
          } else {
            resolve(movieTitles);
          }
        } catch (error: any) {
          console.error("❌ Failed to parse Python output:", error);
          reject(new Error(`Parse error: ${error.message}`));
        }
      });

      // Set timeout after 30 seconds
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error("Python script timeout after 30 seconds"));
      }, 30000);
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
        ratings: {
          select: { score: true },
        },
      },
    });

    console.log(`✅ Found ${movies.length}/${titles.length} movies in database`);

    if (movies.length === 0) {
      console.warn("⚠️ No movies found for the given titles. Database might not have these movies.");
    }

    const moviesWithRatings = movies.map((movie) => {
      const ratings = movie.ratings || [];
      const validRatings = ratings.filter((r) => r.score !== null);
      const avgRating =
        validRatings.length > 0
          ? validRatings.reduce((sum, r) => sum + r.score!, 0) / validRatings.length
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
          role: mc.people.role,
        })),
      };
    });

    // Sort movies to match the order from Python
    const sortedMovies = titles
      .map((title) => moviesWithRatings.find((m) => m.title === title))
      .filter((m) => m !== undefined);

    console.log(`✅ Returning ${sortedMovies.length} sorted movies`);
    return sortedMovies;
  } catch (error: any) {
    console.error("❌ Error in getMoviesByTitles:", error);
    throw error;
  }
};