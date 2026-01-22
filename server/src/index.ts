import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import moviesRoutes from "./routes/movies.routes.js";
import adminRoutes from "./routes/admin/index.js";
import watchlistRoutes from "./routes/watchlist.routes.js"; // NEW
import recommendationRoutes from "./routes/recommendation.routes.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "🎬 MovieHub API is running!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/watchlist", watchlistRoutes); 
app.use("/api/recommendations", recommendationRoutes);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📚 API Endpoints:`);
  console.log(`   Public:`);
  console.log(`   - POST /api/auth/register`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - GET  /api/auth/me`);
  console.log(`   - PUT  /api/auth/profile`);
  console.log(`   - GET  /api/movies`);
  console.log(`   - GET  /api/movies/:id`);
  console.log(`\n   Protected:`);
  console.log(`   - POST /api/movies/:id/rate`);
  console.log(`   - GET  /api/watchlist`); // NEW
  console.log(`   - POST /api/watchlist/:movieId`); // NEW
  console.log(`   - DELETE /api/watchlist/:movieId`); // NEW
  console.log(`\n   Admin (require admin role):`);
  console.log(`   - GET/POST        /api/admin/movies`);
  console.log(`   - GET/PUT/DELETE  /api/admin/movies/:id`);
  console.log(`   - GET/POST        /api/admin/genres`);
  console.log(`   - GET/PUT/DELETE  /api/admin/genres/:id`);
  console.log(`   - GET/POST        /api/admin/casts`);
  console.log(`   - GET/PUT/DELETE  /api/admin/casts/:id`);
  console.log(`   - GET/POST        /api/admin/users`);
  console.log(`   - GET/PUT/DELETE  /api/admin/users/:id`);
  console.log(`   - PATCH           /api/admin/users/:id/role`);
});