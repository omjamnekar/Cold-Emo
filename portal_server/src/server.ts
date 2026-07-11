import dotenv from "dotenv";
import app from "./app.js";
import MongoDatabase from "./database/mongo.db.js";
import { config, validateConfig, isDev } from "./config/index.js";
import { container } from "./services/container.service.js";
import { eventEmitter } from "./services/eventEmitter.service.js";
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
async function startServer() {
  try {
    await MongoDatabase.connect();

    container.registerDatabase(MongoDatabase.getDatabase());

    logger.info("MongoDB Connected");

    const server = app.listen(config.PORT, config.HOST, () => {
      logger.info("Server running", {
        host: config.HOST,
        port: config.PORT,
        env: config.NODE_ENV,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received. Shutting down...`);

      server.close(async () => {
        await MongoDatabase.disconnect(); // Close Mongo connection
        logger.info("MongoDB disconnected");
        process.exit(0);
      });

      setTimeout(() => process.exit(1), 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start application", error as Error);
    process.exit(1);
  }
}

startServer();
