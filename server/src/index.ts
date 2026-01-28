import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import moviesRoutes from "./routes/movies.routes.js";
import adminRoutes from "./routes/admin/index.js";
import watchlistRoutes from "./routes/watchlist.routes.js";
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
app.use("/api/movies", moviesRoutes); // ⭐ This includes rating routes
app.use("/api/admin", adminRoutes);
app.use("/api/watchlist", watchlistRoutes); 
app.use("/api/recommendations", recommendationRoutes);

const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});