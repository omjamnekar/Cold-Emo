import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config, isDev } from "./config/index.js";
import { API_PREFIX } from "./constants/index.js";
import {
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from "./middleware/errorHandler.middleware.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import authRoutes from "./routes/auth.route.js";
import projectRoutes from "./routes/projects.route.js";
import { container } from "./services/container.service.js";

const app: Application = express();
const logger = container.getLogger("App");

/* ============================================
   MIDDLEWARE CHAIN
   ============================================ */

// Security & parsing
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ limit: "10kb" }));

// Logging
if (isDev) {
  app.use(morgan("dev"));
}
app.use(requestLogger);

/* ============================================
   HEALTH CHECK & METRICS
   ============================================ */

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get(
  "/ready",
  asyncHandler(async (req: Request, res: Response) => {
    // Check database, cache, external services
    res.status(200).json({ ready: true });
  }),
);

/* ============================================
   API ROUTES
   ============================================ */

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/projects`, projectRoutes);

// TODO: Add more routes as modules are implemented
// app.use(`${API_PREFIX}/employees`, employeeRoutes);
// app.use(`${API_PREFIX}/search`, searchRoutes);
// app.use(`${API_PREFIX}/emails`, emailRoutes);
// app.use(`${API_PREFIX}/jobs`, jobRoutes);

/* ============================================
   ERROR HANDLING
   ============================================ */

// 404 handler (after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

logger.info("App initialized", {
  env: config.NODE_ENV,
  apiPrefix: API_PREFIX,
});

export default app;
