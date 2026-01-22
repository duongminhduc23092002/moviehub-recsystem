import { Router } from "express";
import { requireAdmin } from "../../middlewares/auth.middleware.js";
import adminMoviesRoutes from "./admin.movies.routes.js";
import adminGenresRoutes from "./admin.genres.routes.js";
import adminCastsRoutes from "./admin.casts.routes.js";
import adminUsersRoutes from "./admin.users.routes.js";
const router = Router();
// ⭐ Tất cả routes trong /admin/* đều yêu cầu admin
router.use(requireAdmin);
router.use("/movies", adminMoviesRoutes);
router.use("/genres", adminGenresRoutes);
router.use("/casts", adminCastsRoutes);
router.use("/users", adminUsersRoutes);
console.log("✅ Admin routes registered:");
console.log("   - /admin/movies (GET, POST, PUT, DELETE)");
console.log("   - /admin/genres (GET, POST, PUT, DELETE)");
console.log("   - /admin/casts (GET, POST, PUT, DELETE)");
console.log("   - /admin/users (GET, POST, PUT, DELETE, PATCH)");
export default router;
