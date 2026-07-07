import dotenv from "dotenv";

dotenv.config();

export const config = {
  // Server
  NODE_ENV: (process.env.NODE_ENV || "development") as
    | "development"
    | "production"
    | "test",
  PORT: parseInt(process.env.PORT || "5000", 10),
  HOST: process.env.HOST || "localhost",

  // Security
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-in-production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || "10", 10),

  // Database
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://user:password@localhost:5432/job_assistant",
  DATABASE_LOG: process.env.DATABASE_LOG === "true",

  // Email Provider
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER || "sendgrid",
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

  // AI Provider
  AI_PROVIDER: process.env.AI_PROVIDER || "openai",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4",

  // Redis (for job queue & caching)
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_FORMAT: process.env.LOG_FORMAT || "json",

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(
    process.env.RATE_LIMIT_WINDOW_MS || "900000",
    10,
  ),
  RATE_LIMIT_MAX_REQUESTS: parseInt(
    process.env.RATE_LIMIT_MAX_REQUESTS || "100",
    10,
  ),

  // Features
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER !== "false",
  ENABLE_METRICS: process.env.ENABLE_METRICS !== "false",
} as const;

export const isDev = config.NODE_ENV === "development";
export const isProd = config.NODE_ENV === "production";
export const isTest = config.NODE_ENV === "test";

// Validation on startup
export function validateConfig(): void {
  const required = [
    "JWT_SECRET",
    "DATABASE_URL",
    "REDIS_URL",
    "OPENAI_API_KEY",
    "SENDGRID_API_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && isProd) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
