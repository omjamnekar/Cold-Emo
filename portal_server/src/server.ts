import dotenv from "dotenv";
import app from "./app.js";
import { config, validateConfig, isDev } from "./config/index.js";
import { container } from "./services/container.js";
import { eventEmitter } from "./services/eventEmitter.js";
import { EVENTS } from "./constants/index.js";

dotenv.config();

const logger = container.getLogger("Server");

// Validate configuration
try {
  validateConfig();
} catch (error) {
  logger.error("Configuration validation failed", error as Error);
  process.exit(1);
}

/* ============================================
   INITIALIZE SERVICES
   ============================================ */

// Set up event listeners for logging
eventEmitter.on(EVENTS.PROJECT_CREATED, (data) => {
  logger.info("Project created", data);
});

eventEmitter.on(EVENTS.PROJECT_DELETED, (data) => {
  logger.info("Project deleted", data);
});

eventEmitter.on(EVENTS.SEARCH_STARTED, (data) => {
  logger.info("Search started", data);
});

eventEmitter.on(EVENTS.JOB_FAILED, (data) => {
  logger.error(`Job failed: ${data.type}`, new Error(data.error));
});

/* ============================================
   START SERVER
   ============================================ */

const PORT = config.PORT;
const HOST = config.HOST;

const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running`, {
    host: HOST,
    port: PORT,
    env: config.NODE_ENV,
  });
});

/* ============================================
   GRACEFUL SHUTDOWN
   ============================================ */

const shutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    logger.info("Server closed");
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled promise rejection", new Error(String(reason)));
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", error);
  process.exit(1);
});
